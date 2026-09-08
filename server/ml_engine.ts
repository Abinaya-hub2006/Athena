import { Task, DailyPlan, StudySubject, MLModelStatus, RecommendationFeedback } from '../src/types';
import { db } from './db';

export class AthenaMLEngine {
  /**
   * Calculates smart priority scores and ranks tasks with natural language explanations.
   */
  public rankTasks(tasks: Task[], subjects: StudySubject[]): Task[] {
    const weights = db.getModelWeights();
    const now = new Date().getTime();

    // Map topic mastery for lookup
    const topicMasteryMap: Record<string, number> = {};
    for (const sub of subjects) {
      for (const t of sub.topics) {
        topicMasteryMap[t.name.toLowerCase()] = t.currentMastery;
      }
    }

    const scoredTasks = tasks.map((task) => {
      // Completed or cancelled tasks stay at bottom
      if (task.status === 'Completed' || task.status === 'Cancelled') {
        return {
          ...task,
          calculatedScore: 0,
          recommendedRank: 999,
          recommendationReason: 'Already finished or cancelled.'
        };
      }

      // 1. Deadline Proximity Score (0 - 100)
      let deadlineScore = 30; // default if no deadline
      let daysUntilDeadline = 999;
      if (task.deadline) {
        const deadlineTime = new Date(task.deadline).getTime();
        const diffHours = (deadlineTime - now) / (1000 * 60 * 60);
        daysUntilDeadline = diffHours / 24;

        if (diffHours <= 0) {
          deadlineScore = 100; // Overdue
        } else if (diffHours <= 24) {
          deadlineScore = 98; // Due within 24 hours
        } else if (diffHours <= 48) {
          deadlineScore = 88; // Due within 2 days
        } else if (diffHours <= 120) {
          deadlineScore = 72; // Due within 5 days
        } else {
          deadlineScore = Math.max(20, 60 - daysUntilDeadline * 2);
        }
      }

      // 2. Base Priority Score (0 - 100)
      const priorityMap: Record<string, number> = {
        Critical: 95,
        High: 75,
        Medium: 50,
        Low: 25
      };
      const basePriorityScore = priorityMap[task.priority] || 50;

      // 3. Subject / Topic Mastery Gap (0 - 100)
      let masteryScore = 50;
      if (task.tags.some((t) => t.includes('weak-area') || t.includes('dp'))) {
        masteryScore = 85; // Prioritize known weaknesses
      } else if (task.subject) {
        // Find subject topic
        const matchedTopic = Object.keys(topicMasteryMap).find((k) =>
          task.title.toLowerCase().includes(k) || (task.description && task.description.toLowerCase().includes(k))
        );
        if (matchedTopic) {
          const mastery = topicMasteryMap[matchedTopic];
          // lower mastery gives higher urgency to study
          masteryScore = Math.max(20, 100 - mastery);
        }
      }

      // 4. Effort & Actionability (0 - 100)
      // Shorter tasks (30-60m) are easier to activate than daunting 3-hour tasks
      let effortScore = 60;
      if (task.estimatedEffortMinutes <= 45) {
        effortScore = 80;
      } else if (task.estimatedEffortMinutes <= 90) {
        effortScore = 70;
      } else {
        effortScore = 45; // high friction
      }

      // 5. Postponed Starvation Prevention
      const postponedBonus = Math.min(25, (task.postponedCount || 0) * 8);

      // Weighted Multi-Factor Formula
      const rawScore =
        (weights.deadlineWeight || 0.35) * deadlineScore +
        (weights.importanceWeight || 0.25) * basePriorityScore +
        (weights.masteryGapWeight || 0.18) * masteryScore +
        (weights.effortEfficiencyWeight || 0.12) * effortScore +
        (weights.goalAlignmentWeight || 0.10) * 70 +
        postponedBonus;

      const finalScore = Math.min(99, Math.max(15, Math.round(rawScore)));

      // Generate human-friendly justification
      let reason = '';
      if (task.deadline && daysUntilDeadline <= 1.2) {
        reason = 'Recommended first because the deadline is tomorrow and delay carries immediate consequence.';
      } else if (task.deadline && daysUntilDeadline <= 3) {
        reason = `Approaching deadline in ${Math.round(daysUntilDeadline)} days; early start avoids last-minute cramming.`;
      } else if (task.tags.includes('weak-area') || masteryScore > 75) {
        reason = 'Identified learning priority: Addresses a known weak topic ahead of interview/exam schedule.';
      } else if (task.estimatedEffortMinutes <= 30) {
        reason = 'Quick win: High leverage milestone achievable in under 30 minutes.';
      } else if (task.priority === 'Critical' || task.priority === 'High') {
        reason = 'High strategic importance aligned with your current semester goals.';
      } else {
        reason = 'Balanced recommendation based on your active workload and project priorities.';
      }

      return {
        ...task,
        calculatedScore: finalScore,
        recommendationReason: reason
      };
    });

    // Sort active tasks by score descending
    const activeTasks = scoredTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');
    const inactiveTasks = scoredTasks.filter((t) => t.status === 'Completed' || t.status === 'Cancelled');

    activeTasks.sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0));

    // Assign rank 1, 2, 3...
    activeTasks.forEach((t, i) => {
      t.recommendedRank = i + 1;
    });

    return [...activeTasks, ...inactiveTasks];
  }

  /**
   * Generates a realistic, non-rigid daily plan adapting to user time and energy.
   */
  public generateDailyPlan(availableHours: number, energyLevel: 'High' | 'Normal' | 'Low' | 'Tired'): DailyPlan {
    const subjects = db.getSubjects();
    const rankedTasks = this.rankTasks(db.getTasks(), subjects).filter(
      (t) => t.status !== 'Completed' && t.status !== 'Cancelled'
    );

    const availableMinutes = availableHours * 60;
    let allocatedMinutes = 0;

    const mustDo: Task[] = [];
    const shouldDo: Task[] = [];
    const ifYouHaveTime: Task[] = [];

    // Fatigue or Low energy adjusts allocation behavior
    const isFatigued = energyLevel === 'Tired' || energyLevel === 'Low';

    for (const task of rankedTasks) {
      const taskEffort = task.estimatedEffortMinutes || 45;

      // Must Do: Top critical urgency or due tomorrow
      const isUrgent =
        task.priority === 'Critical' ||
        (task.deadline && new Date(task.deadline).getTime() - Date.now() < 36 * 3600 * 1000);

      if (isUrgent && mustDo.length < (isFatigued ? 1 : 2)) {
        mustDo.push(task);
        allocatedMinutes += taskEffort;
        continue;
      }

      // Should Do: High value tasks within remaining budget
      if (allocatedMinutes + taskEffort <= availableMinutes * 0.85 && shouldDo.length < (isFatigued ? 1 : 3)) {
        shouldDo.push(task);
        allocatedMinutes += taskEffort;
        continue;
      }

      // If You Have Time: lower pressure or bonus tasks
      if (ifYouHaveTime.length < 3) {
        ifYouHaveTime.push(task);
      }
    }

    // Conversational Athena note based on context
    let athenaNote = '';
    if (isFatigued) {
      athenaNote = `I noticed you're feeling ${energyLevel.toLowerCase()} today. I've scaled back your targets to just 1 essential focus. Finish the urgent assignment, take restful breaks, and leave heavy problem sets for tomorrow.`;
    } else if (availableHours <= 2) {
      athenaNote = `With a tight ${availableHours}-hour window, focus strictly on the top milestone. Avoid context switching to maximize depth.`;
    } else if (availableHours >= 4) {
      athenaNote = `You have generous focus time today (${availableHours}h). I've scheduled a balanced blend of academic deadline prep and conceptual revision, with scheduled recharge intervals.`;
    } else {
      athenaNote = `Here is your realistic focus plan for today. Pace yourself steadily and complete the Must Do items first.`;
    }

    return {
      date: new Date().toISOString().split('T')[0],
      availableHours,
      energyLevel,
      mustDo,
      shouldDo,
      ifYouHaveTime,
      suggestedBreakMinutes: isFatigued ? 20 : 10,
      athenaNote
    };
  }

  /**
   * Simulates an MLOps retraining run with MLflow tracking semantics.
   */
  public triggerRetraining(): MLModelStatus {
    const current = db.getMLStatus();
    const newVersion = 'v1.3-boosted-tree-' + Math.floor(100 + Math.random() * 900);
    
    // Simulate training evaluation metrics
    const newAccuracy = Math.min(0.94, +(0.85 + Math.random() * 0.08).toFixed(2));
    const newNdcg = Math.min(0.96, +(0.88 + Math.random() * 0.07).toFixed(2));

    const experiment = {
      id: 'exp-' + (current.recentExperiments.length + 101),
      name: `Retrained Model (${newVersion})`,
      modelType: 'RankXGBoost / Online Learner',
      accuracy: newAccuracy,
      ndcg: newNdcg,
      status: 'Deployed' as const,
      date: new Date().toISOString().split('T')[0]
    };

    // Archive previous deployed experiment
    const updatedExperiments: MLModelStatus['recentExperiments'] = current.recentExperiments.map((exp) => ({
      ...exp,
      status: exp.status === 'Deployed' ? ('Archived' as const) : exp.status
    }));

    updatedExperiments.unshift(experiment);

    const updatedStatus: MLModelStatus = {
      ...current,
      baselineVersion: current.currentModelVersion,
      currentModelVersion: newVersion,
      deployedAt: new Date().toISOString(),
      driftStatus: 'No Drift',
      driftMetrics: {
        acceptanceDriftPercent: 0.8,
        featureShiftScore: 0.01,
        lastDriftCheck: new Date().toISOString()
      },
      recentExperiments: updatedExperiments.slice(0, 6)
    };

    db.updateMLStatus(updatedStatus);
    return updatedStatus;
  }
}

export const mlEngine = new AthenaMLEngine();
