window.__ModuleLoader__.load({
  id: '@local/progress-board',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const NS = 'progressBoard'
    const API = '/progress-board'
    const PANEL_ID = 'progress-board'
    const RIGHT_TAB_ID = '@local/progress-board'
    const RIGHT_TAB_KIND = 'progress-board'

    const zh = {
      nav: '进度板',
      title: '进度板',
      subtitle: '你可以直接修改；Agent 只会在下一步读取你改动的那一部分。',
      live: '实时同步',
      saving: '保存中…',
      loading: '正在读取进度…',
      noSessionTitle: '先打开一个会话',
      noSessionBody: '进度板按会话独立保存。在左侧打开一个会话后，这里会显示它的工作进度。',
      emptyTitle: '进度板还是空的',
      emptyBody: '在下面添加任务，或让 Agent 开始工作时用 progress_update 建立任务清单。',
      addPlaceholder: '添加一个可交付的任务…',
      add: '添加',
      adding: '添加中…',
      retry: '重试',
      refresh: '刷新',
      pending: '待同步改动',
      saved: '已持久化',
      memoryOnly: '仅本次运行',
      lastUpdate: '更新于',
      revision: '版本',
      statusTodo: '未开始',
      statusDoing: '进行中',
      statusDone: '已完成',
      statusBlocked: '等待确认',
      doingTitle: '正在做',
      todoTitle: '尚未开始',
      blockedTitle: '等待你确认',
      doneTitle: '已完成',
      overall: '总进度',
      current: '当前动作',
      next: '下一步',
      approach: '当前思路与实现',
      approachPh: '为什么这样做、当前实现路径…',
      note: '备注',
      addNote: '添加备注',
      hideNote: '收起备注',
      titlePh: '任务标题',
      currentPh: '现在在做什么',
      nextPh: '下一步做什么',
      notePh: '假设、阻塞原因、补充说明…',
      delete: '删除',
      confirmDelete: '确认删除',
      moveUp: '上移',
      moveDown: '下移',
      agent: 'Agent',
      you: '你',
      blockedHint: '这些任务在等你确认。Agent 应在对话中提出选项化的问题；你回答后它会恢复。',
      emptyDoing: '当前没有标记为进行中的任务。',
      emptyTodo: '没有待办任务。',
      emptyBlocked: '没有等待确认的任务。',
      readError: '读取进度失败：',
      saveError: '保存失败：',
      storageWarn: '进度存储不可用，当前改动只保存在本次运行中。',
      footerHint: '约每 3 秒同步一次；输入框失焦后自动保存。',
      editHint: '标题、当前动作、下一步和备注都可以直接编辑。',
      doneCount: '项已完成',
      taskCount: '项任务',
      allDone: '全部完成',
      noDoing: '当前没有进行中的任务。',
      blockedCount: '项等待确认',
      percent: '进度',
      dockHint: '点击打开完整进度板',
      dockExpand: '展开',
      dockCollapse: '收起',
      dockEdit: '编辑',
      dockOpenFull: '打开完整进度板',
      dockAllDone: '全部完成',
      dockNext: '下一步',
      dockPending: '待同步',
      sideCompleted: '已完成的任务',
      sideLatest: '最新完成',
      sideDetails: '详情',
      sideCurrentTask: '当前任务',
      sidePending: '待完成',
      sideCollapse: '收起',
      sideFull: '全面展开',
      lastSync: '同步于',
      syncFailed: '同步失败',
      sideHalf: '恢复半开',
      sideOpenFull: '完整面板',
      sideEditable: '可直接修改',
      sideEmptyDone: '还没有完成的任务',
      sideEmptyPending: '没有待完成的任务',
      sideApproachEmpty: '还没有记录实现思路',
      sideProgress: '进度',
      sideDone: '完成',
      sideAllDone: '其他已完成',
    }

    const en = {
      nav: 'Progress board',
      title: 'Progress board',
      subtitle: 'Edit anything directly; the agent reads only the changed part at its next step.',
      live: 'Live sync',
      saving: 'Saving…',
      loading: 'Loading progress…',
      noSessionTitle: 'Open a session first',
      noSessionBody: 'The board is stored per session. Open a session from the sidebar and its progress will appear here.',
      emptyTitle: 'The board is empty',
      emptyBody: 'Add a task below, or let the agent create the list with progress_update when work starts.',
      addPlaceholder: 'Add a deliverable task…',
      add: 'Add',
      adding: 'Adding…',
      retry: 'Retry',
      refresh: 'Refresh',
      pending: 'Pending edits',
      saved: 'Saved',
      memoryOnly: 'This run only',
      lastUpdate: 'Updated',
      revision: 'Revision',
      statusTodo: 'Not started',
      statusDoing: 'In progress',
      statusDone: 'Done',
      statusBlocked: 'Needs you',
      doingTitle: 'In progress',
      todoTitle: 'Not started',
      blockedTitle: 'Waiting for you',
      doneTitle: 'Done',
      overall: 'Overall',
      current: 'Current',
      next: 'Next',
      approach: 'Approach',
      approachPh: 'Why this way, current implementation path…',
      note: 'Note',
      addNote: 'Add note',
      hideNote: 'Hide note',
      titlePh: 'Task title',
      currentPh: 'What is happening now',
      nextPh: 'What happens next',
      notePh: 'Assumptions, blockers, context…',
      delete: 'Delete',
      confirmDelete: 'Confirm delete',
      moveUp: 'Move up',
      moveDown: 'Move down',
      agent: 'Agent',
      you: 'You',
      blockedHint: 'These tasks wait for you. The agent should ask an option-based question in chat and resume after your answer.',
      emptyDoing: 'No task is marked in progress.',
      emptyTodo: 'No pending tasks.',
      emptyBlocked: 'Nothing is waiting for you.',
      readError: 'Could not read progress: ',
      saveError: 'Could not save: ',
      storageWarn: 'Progress storage is unavailable; edits live only in this run.',
      footerHint: 'Syncs about every 3 s; edits save when the field loses focus.',
      editHint: 'Title, current, next, and note are directly editable.',
      doneCount: 'done',
      taskCount: 'tasks',
      allDone: 'All done',
      noDoing: 'Nothing is in progress right now.',
      blockedCount: 'waiting for you',
      percent: 'Progress',
      dockHint: 'Open the full progress board',
      dockExpand: 'Expand',
      dockCollapse: 'Collapse',
      dockEdit: 'Edit',
      dockOpenFull: 'Open full board',
      dockAllDone: 'All done',
      dockNext: 'Next',
      dockPending: 'pending',
      sideCompleted: 'Completed',
      sideLatest: 'Latest completed',
      sideDetails: 'Details',
      sideCurrentTask: 'Current task',
      sidePending: 'Pending',
      sideCollapse: 'Collapse',
      sideFull: 'Fullscreen',
      lastSync: 'Synced',
      syncFailed: 'Sync failed',
      sideHalf: 'Half width',
      sideOpenFull: 'Full board',
      sideEditable: 'Editable',
      sideEmptyDone: 'Nothing completed yet',
      sideEmptyPending: 'Nothing pending',
      sideApproachEmpty: 'No approach recorded yet',
      sideProgress: 'Progress',
      sideDone: 'Done',
      sideAllDone: 'Other completed',
    }

    const STATUS_KEYS = ['todo', 'doing', 'done', 'blocked']
    const STATUS_LABEL = {
      todo: 'statusTodo',
      doing: 'statusDoing',
      done: 'statusDone',
      blocked: 'statusBlocked',
    }

    const CSS = `
      .pb-root {
        box-sizing: border-box;
        height: 100%;
        min-height: 100%;
        overflow: auto;
        padding: 28px 32px 56px;
        color: var(--dsw-alias-label-primary);
        background: var(--dsw-alias-bg-base);
        font-family: inherit;
        font-size: 14px;
        line-height: 1.5;
      }
      .pb-inner { width: 100%; max-width: 1040px; margin: 0 auto; }
      .pb-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
      .pb-title { margin: 0; font-size: 22px; line-height: 1.25; font-weight: 650; letter-spacing: -.01em; }
      .pb-sub { margin: 6px 0 0; max-width: 680px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
      .pb-head-right { display: flex; align-items: center; gap: 10px; flex: none; padding-top: 3px; }
      .pb-live { display: inline-flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; white-space: nowrap; }
      .pb-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--dsw-alias-state-success-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, transparent); }
      .pb-saving { color: var(--dsw-alias-label-secondary); font-size: 12px; }
      .pb-btn {
        appearance: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
        padding: 5px 10px; font: inherit; font-size: 12px; line-height: 1.4; cursor: pointer;
      }
      .pb-btn:hover:not(:disabled) { border-color: var(--dsw-alias-border-l2); }
      .pb-btn:disabled { opacity: .42; cursor: not-allowed; }
      .pb-btn-primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); font-weight: 600; }
      .pb-btn-danger { color: var(--dsw-alias-state-error-primary); }
      .pb-icon-btn { min-width: 28px; padding: 4px 7px; }
      .pb-overview {
        position: relative; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1); padding: 18px 20px; margin-bottom: 22px;
      }
      .pb-overview-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
      .pb-big { font-size: 34px; line-height: 1; font-weight: 680; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
      .pb-big small { margin-left: 3px; font-size: 15px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
      .pb-counts { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
      .pb-chip { display: inline-flex; align-items: center; gap: 5px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); padding: 3px 9px; color: var(--dsw-alias-label-secondary); font-size: 12px; white-space: nowrap; }
      .pb-chip strong { color: var(--dsw-alias-label-primary); font-weight: 600; font-variant-numeric: tabular-nums; }
      .pb-bar { height: 8px; margin: 15px 0 0; border-radius: 999px; overflow: hidden; background: var(--dsw-alias-bg-layer-2); }
      .pb-bar > i { display: block; height: 100%; border-radius: inherit; background: var(--dsw-alias-brand-primary); transition: width .25s ease; }
      .pb-focus { display: flex; align-items: center; gap: 9px; margin-top: 13px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
      .pb-focus b { color: var(--dsw-alias-label-primary); font-weight: 600; }
      .pb-badge-pending { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 8px; font-size: 11px; color: var(--dsw-alias-state-warn-primary); background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent); }
      .pb-warn {
        margin: 0 0 18px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 45%, var(--dsw-alias-border-l1));
        border-radius: 10px; background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 9%, var(--dsw-alias-bg-layer-1));
        padding: 10px 12px; color: var(--dsw-alias-label-primary); font-size: 12px;
      }
      .pb-warn-error { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l1)); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, var(--dsw-alias-bg-layer-1)); }
      .pb-section { margin-top: 22px; }
      .pb-section-head { display: flex; align-items: baseline; gap: 9px; margin: 0 0 9px; }
      .pb-section-title { margin: 0; font-size: 13px; font-weight: 650; letter-spacing: .01em; }
      .pb-section-count { color: var(--dsw-alias-label-secondary); font-size: 12px; font-variant-numeric: tabular-nums; }
      .pb-list { display: flex; flex-direction: column; gap: 8px; }
      .pb-item {
        border: 1px solid var(--dsw-alias-border-l1); border-radius: 11px;
        background: var(--dsw-alias-bg-layer-1); padding: 11px 13px 10px;
      }
      .pb-item.pb-doing { border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 38%, var(--dsw-alias-border-l1)); }
      .pb-item.pb-blocked { border-left: 3px solid var(--dsw-alias-state-warn-primary); }
      .pb-item.pb-done { opacity: .72; }
      .pb-item-head { display: grid; grid-template-columns: 98px minmax(0, 1fr) 70px auto; align-items: center; gap: 8px; }
      .pb-status {
        width: 100%; appearance: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px;
        background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
        padding: 5px 7px; font: inherit; font-size: 12px; line-height: 1.35;
      }
      .pb-status:focus, .pb-input:focus, .pb-note:focus, .pb-percent input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent); }
      .pb-status.pb-s-doing { color: var(--dsw-alias-brand-primary); font-weight: 600; }
      .pb-status.pb-s-done { color: var(--dsw-alias-state-success-primary); }
      .pb-status.pb-s-blocked { color: var(--dsw-alias-state-warn-primary); }
      .pb-input {
        box-sizing: border-box; width: 100%; min-width: 0; border: 1px solid transparent; border-radius: 7px;
        background: transparent; color: var(--dsw-alias-label-primary); padding: 5px 7px; font: inherit; line-height: 1.4;
      }
      .pb-input:hover { border-color: var(--dsw-alias-border-l1); }
      .pb-input.pb-title-input { font-weight: 600; }
      .pb-input::placeholder, .pb-note::placeholder { color: var(--dsw-alias-label-secondary); opacity: .72; }
      .pb-percent { display: flex; align-items: center; justify-content: flex-end; gap: 4px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
      .pb-percent input {
        width: 44px; box-sizing: border-box; border: 1px solid transparent; border-radius: 6px;
        background: transparent; color: var(--dsw-alias-label-primary); padding: 3px 2px; font: inherit; font-size: 12px; text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .pb-percent input:hover { border-color: var(--dsw-alias-border-l1); }
      .pb-actions { display: flex; align-items: center; gap: 2px; opacity: .55; transition: opacity .15s; }
      .pb-item:hover .pb-actions, .pb-actions:focus-within { opacity: 1; }
      .pb-subgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; margin: 5px 0 0 98px; }
      .pb-field-label { display: block; margin: 0 0 1px; color: var(--dsw-alias-label-secondary); font-size: 10px; letter-spacing: .03em; text-transform: uppercase; }
      .pb-approach {
        box-sizing: border-box; width: calc(100% - 98px); min-height: 38px; resize: vertical;
        margin: 6px 0 0 98px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px;
        background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
        padding: 6px 8px; font: inherit; font-size: 12px; line-height: 1.45;
      }
      .pb-approach-label { margin: 7px 0 0 98px; }
      .pb-note {
        box-sizing: border-box; width: calc(100% - 98px); min-height: 44px; resize: vertical;
        margin: 6px 0 0 98px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px;
        background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
        padding: 6px 8px; font: inherit; font-size: 12px; line-height: 1.45;
      }
      .pb-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 7px 0 0 98px; color: var(--dsw-alias-label-secondary); font-size: 11px; }
      .pb-meta-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .pb-by { border-radius: 999px; background: var(--dsw-alias-bg-layer-2); padding: 1px 6px; }
      .pb-note-toggle { border: 0; background: transparent; color: var(--dsw-alias-label-secondary); padding: 1px 0; font: inherit; font-size: 11px; cursor: pointer; }
      .pb-note-toggle:hover { color: var(--dsw-alias-label-primary); }
      .pb-empty { border: 1px dashed var(--dsw-alias-border-l2); border-radius: 12px; padding: 22px 18px; text-align: center; background: var(--dsw-alias-bg-layer-1); }
      .pb-empty h2 { margin: 0 0 5px; font-size: 15px; }
      .pb-empty p { margin: 0 auto; max-width: 540px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
      .pb-add { display: flex; gap: 8px; margin-top: 20px; }
      .pb-add .pb-input { flex: 1; min-width: 0; border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); padding: 9px 11px; }
      .pb-add .pb-btn { flex: none; white-space: nowrap; padding: 8px 14px; font-size: 13px; }
      .pb-done-box { margin-top: 22px; }
      .pb-done-box > summary { cursor: pointer; color: var(--dsw-alias-label-secondary); font-size: 12px; padding: 4px 0; user-select: none; }
      .pb-done-box > summary:hover { color: var(--dsw-alias-label-primary); }
      .pb-done-box .pb-list { margin-top: 8px; }
      .pb-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; margin-top: 26px; padding-top: 12px; border-top: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); font-size: 11px; }
      .pb-footer span { white-space: nowrap; }
      .pb-sep { opacity: .45; }
      .pb-blocked-hint { margin: 0 0 8px; color: var(--dsw-alias-state-warn-primary); font-size: 12px; }
      .pb-header-btn {
        display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px;
        border: 1px solid transparent; border-radius: 6px; background: transparent;
        color: var(--dsw-alias-label-secondary); cursor: pointer; padding: 0;
      }
      .pb-header-btn:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
      .pb-dock-wrap { display: flex; justify-content: center; width: 100%; }
      .pb-dock {
        box-sizing: border-box; width: calc(100% + var(--dsh-composer-dock-inset, 8px) + var(--dsh-composer-dock-inset, 8px) + var(--dsh-composer-dock-inset, 8px) + var(--dsh-composer-dock-inset, 8px));
        max-width: var(--dsh-composer-card-max-width, none);
        flex: none;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 10px; background: var(--dsw-alias-bg-layer-1); padding: 7px 9px;
        color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 12px;
      }
      .pb-dock-row { display: flex; align-items: center; gap: 9px; }
      .pb-dock-main {
        flex: 1; min-width: 0; display: flex; align-items: center; gap: 9px;
        border: 0; background: transparent; color: inherit; font: inherit; padding: 0;
        cursor: pointer; text-align: left;
      }
      .pb-dock-main:hover .pb-dock-title { color: var(--dsw-alias-brand-primary); }
      .pb-dock-percent { flex: none; min-width: 34px; font-size: 13px; font-weight: 650; font-variant-numeric: tabular-nums; }
      .pb-dock-bar { flex: none; width: 64px; height: 5px; border-radius: 999px; overflow: hidden; background: var(--dsw-alias-bg-layer-2); }
      .pb-dock-bar > i { display: block; height: 100%; border-radius: inherit; background: var(--dsw-alias-brand-primary); transition: width .25s ease; }
      .pb-dock-body { flex: 1; min-width: 0; line-height: 1.3; }
      .pb-dock-title { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 12px; font-weight: 600; transition: color .15s; }
      .pb-dock-sub { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-top: 1px; color: var(--dsw-alias-label-secondary); font-size: 11px; }
      .pb-dock-actions { flex: none; display: flex; align-items: center; gap: 4px; }
      .pb-dock-btn {
        appearance: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px;
        background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary);
        padding: 2px 7px; font: inherit; font-size: 11px; line-height: 1.4; cursor: pointer;
      }
      .pb-dock-btn:hover { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }
      .pb-dock-expanded {
        display: flex; flex-direction: column; gap: 3px; margin-top: 7px; padding-top: 7px;
        border-top: 1px solid var(--dsw-alias-border-l1); max-height: 180px; overflow: auto;
      }
      .pb-dock-item { display: flex; align-items: center; gap: 7px; min-width: 0; padding: 3px 1px; }
      .pb-dock-dot { flex: none; width: 6px; height: 6px; border-radius: 999px; background: var(--dsw-alias-state-idle-primary); }
      .pb-dock-dot.doing { background: var(--dsw-alias-brand-primary); }
      .pb-dock-dot.done { background: var(--dsw-alias-state-success-primary); }
      .pb-dock-dot.blocked { background: var(--dsw-alias-state-warn-primary); }
      .pb-dock-item-title { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 12px; }
      .pb-dock-item-meta { flex: none; color: var(--dsw-alias-label-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }
      .pb-dock-more { border: 0; background: transparent; color: var(--dsw-alias-brand-primary); padding: 4px 1px; font: inherit; font-size: 11px; text-align: left; cursor: pointer; }
      .pb-side {
        box-sizing: border-box; height: 100%; overflow: auto; padding: 14px 14px 28px;
        color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base);
        font-family: inherit; font-size: 13px; line-height: 1.45;
      }
      .pb-side-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
      .pb-side-head-actions { display: flex; align-items: center; gap: 4px; flex: none; }
      .pb-side-title { margin: 0; font-size: 16px; font-weight: 650; letter-spacing: -.01em; }
      .pb-side-sub { margin: 3px 0 0; color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 1.4; }
      .pb-side-section { margin-top: 15px; }
      .pb-side-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; color: var(--dsw-alias-label-secondary); font-size: 10px; letter-spacing: .04em; text-transform: uppercase; }
      .pb-side-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); padding: 9px 10px; }
      .pb-side-card + .pb-side-card { margin-top: 6px; }
      .pb-side-done-card { border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 32%, var(--dsw-alias-border-l1)); }
      .pb-side-check { color: var(--dsw-alias-state-success-primary); font-weight: 700; }
      .pb-side-done-title { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 12px; font-weight: 600; }
      .pb-side-meta { flex: none; color: var(--dsw-alias-label-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }
      .pb-side-note { margin: 5px 0 0; color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
      .pb-side-bar { height: 5px; margin-top: 7px; border-radius: 999px; overflow: hidden; background: var(--dsw-alias-bg-layer-2); }
      .pb-side-bar > i { display: block; height: 100%; border-radius: inherit; background: var(--dsw-alias-brand-primary); transition: width .25s ease; }
      .pb-side-task-head { display: flex; align-items: center; gap: 5px; }
      .pb-side-task-head .pb-status { flex: none; width: 88px; }
      .pb-side-task-head .pb-input { flex: 1; font-weight: 600; }
      .pb-side-task-head .pb-percent { flex: none; }
      .pb-side-field { display: block; margin-top: 6px; }
      .pb-side-field .pb-field-label { margin-bottom: 2px; }
      .pb-side-input, .pb-side-textarea {
        box-sizing: border-box; width: 100%; border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px;
        background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
        padding: 5px 7px; font: inherit; font-size: 12px; line-height: 1.45;
      }
      .pb-side-textarea { min-height: 48px; resize: vertical; }
      .pb-side-input:focus, .pb-side-textarea:focus { outline: none; border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent); }
      .pb-side-done-all { margin-top: 6px; }
      .pb-side-done-all > summary { cursor: pointer; color: var(--dsw-alias-label-secondary); font-size: 11px; padding: 4px 0; user-select: none; }
      .pb-side-done-all > summary:hover { color: var(--dsw-alias-label-primary); }
      .pb-side-done-item { border-top: 1px solid var(--dsw-alias-border-l1); padding: 5px 0; }
      .pb-side-done-item > summary { display: flex; align-items: center; gap: 6px; cursor: pointer; list-style: none; }
      .pb-side-done-item > summary::-webkit-details-marker { display: none; }
      .pb-side-done-item .pb-side-done-title { font-weight: 500; font-size: 11px; }
      .pb-side-done-item .pb-side-detail-line, .pb-side-done-item .pb-side-note { margin-left: 12px; }
      .pb-side-detail-line { margin-top: 6px; color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
      .pb-side-detail-line b { color: var(--dsw-alias-label-primary); font-weight: 600; }
      .pb-side-empty { border: 1px dashed var(--dsw-alias-border-l2); border-radius: 9px; padding: 12px 10px; text-align: center; color: var(--dsw-alias-label-secondary); font-size: 11px; }
      .pb-side-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-top: 16px; padding-top: 10px; border-top: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); font-size: 11px; }
      .pb-side-link { border: 0; background: transparent; color: var(--dsw-alias-brand-primary); padding: 0; font: inherit; font-size: 11px; cursor: pointer; }
      .pb-side-error { margin-bottom: 10px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l1)); border-radius: 8px; background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, var(--dsw-alias-bg-layer-1)); padding: 7px 8px; color: var(--dsw-alias-label-primary); font-size: 11px; }
      .pb-loading { padding: 46px 0; text-align: center; color: var(--dsw-alias-label-secondary); font-size: 13px; }
      @media (max-width: 760px) {
        .pb-dock-bar { display: none; }
        .pb-dock-sub { max-width: 42vw; }
        .pb-root { padding: 20px 16px 44px; }
        .pb-head { flex-direction: column; gap: 10px; }
        .pb-overview-top { align-items: flex-start; flex-direction: column; gap: 10px; }
        .pb-counts { justify-content: flex-start; }
        .pb-item-head { grid-template-columns: 92px minmax(0, 1fr) 64px; }
        .pb-actions { grid-column: 1 / -1; justify-content: flex-end; }
        .pb-subgrid { grid-template-columns: 1fr; margin-left: 0; }
        .pb-approach { width: 100%; margin-left: 0; }
        .pb-approach-label { margin-left: 0; }
        .pb-note { width: 100%; margin-left: 0; }
        .pb-meta { margin-left: 0; }
        .pb-side { padding: 12px 10px 24px; }
        .pb-side-task-head { flex-wrap: wrap; }
        .pb-side-task-head .pb-status { width: 100%; }
      }
    `

    function makeT(props) {
      return (key) => {
        try {
          const value = props.t ? props.t(key) : undefined
          if (typeof value === 'string' && value) return value
        } catch (_error) {
          // Fall through to the built-in Chinese dictionary.
        }
        return zh[key] || key
      }
    }

    function statusLabel(t, status) {
      return t(STATUS_LABEL[status] || status)
    }

    function errorText(error) {
      return error instanceof Error ? error.message : String(error)
    }

    async function postChanges(sessionId, expectedRevision, changes) {
      const response = await fetch(`${API}/action`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, expectedRevision, changes }),
      })
      const body = await response.json().catch(() => null)
      return { response, body }
    }

    async function setPanelActive(sessionId, active) {
      try {
        await fetch(`${API}/active`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, active, source: 'panel' }),
        })
      } catch (_error) {
        // The board still works; only automatic Agent updates are unavailable.
      }
    }

    function ProgressNavIcon({ size = 20 }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block' },
        },
        h('path', {
          d: 'M4 7.2h8.2M4 12h11.2M4 16.8h6.2',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
        }),
        h('circle', { cx: 18.1, cy: 7.2, r: 2.25, stroke: 'currentColor', strokeWidth: 1.7 }),
        h('path', {
          d: 'M17.2 7.2l.7.7 1.4-1.5',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        h('circle', { cx: 18.1, cy: 16.8, r: 2.25, stroke: 'currentColor', strokeWidth: 1.7 }),
      )
    }

    function ProgressHeaderButton(props) {
      const t = makeT(props)
      return h(
        'button',
        {
          type: 'button',
          className: 'pb-header-btn',
          title: t('nav'),
          'aria-label': t('nav'),
          onClick: () => {
            try {
              props.openPanel?.()
            } catch (_error) {
              // The mini bar and sidebar remain available.
            }
          },
        },
        h(ProgressNavIcon, { size: 17 }),
      )
    }

    function EditableText({ value, placeholder, onCommit, multiline, className, disabled, ariaLabel }) {
      const [draft, setDraft] = useState(value || '')
      const [focused, setFocused] = useState(false)
      useEffect(() => {
        if (!focused) setDraft(value || '')
      }, [value, focused])

      const commit = () => {
        setFocused(false)
        const next = draft.trim()
        setDraft(next)
        if (next !== (value || '')) onCommit(next)
      }

      const shared = {
        value: draft,
        placeholder,
        disabled,
        className,
        'aria-label': ariaLabel || placeholder,
        onFocus: () => setFocused(true),
        onChange: (event) => setDraft(event.target.value),
        onBlur: commit,
      }

      if (multiline) {
        return h('textarea', {
          ...shared,
          rows: 2,
          onKeyDown: (event) => {
            if (event.key === 'Escape') {
              setDraft(value || '')
              event.currentTarget.blur()
            }
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              event.currentTarget.blur()
            }
          },
        })
      }

      return h('input', {
        ...shared,
        type: 'text',
        onKeyDown: (event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            event.currentTarget.blur()
          }
          if (event.key === 'Escape') {
            setDraft(value || '')
            event.currentTarget.blur()
          }
        },
      })
    }

    function PercentEditor({ value, onCommit, disabled, label }) {
      const [draft, setDraft] = useState(String(value))
      const [focused, setFocused] = useState(false)
      useEffect(() => {
        if (!focused) setDraft(String(value))
      }, [value, focused])

      const commit = () => {
        setFocused(false)
        const number = Number(draft)
        if (!Number.isFinite(number)) {
          setDraft(String(value))
          return
        }
        const next = Math.max(0, Math.min(100, Math.round(number)))
        setDraft(String(next))
        if (next !== value) onCommit(next)
      }

      return h(
        'label',
        { className: 'pb-percent', title: label },
        h('input', {
          type: 'number',
          min: 0,
          max: 100,
          step: 1,
          value: draft,
          disabled,
          'aria-label': label,
          onFocus: () => setFocused(true),
          onChange: (event) => setDraft(event.target.value),
          onBlur: commit,
          onKeyDown: (event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              event.currentTarget.blur()
            }
          },
        }),
        h('span', null, '%'),
      )
    }

    function ItemCard({ item, t, disabled, canMoveUp, canMoveDown, onPatch, onRemove, onMove }) {
      const [showNote, setShowNote] = useState(Boolean(item.note))
      const [confirmDelete, setConfirmDelete] = useState(false)
      useEffect(() => {
        if (item.note) setShowNote(true)
      }, [item.note])
      useEffect(() => {
        setConfirmDelete(false)
      }, [item.status, item.title])

      return h(
        'article',
        { className: `pb-item pb-${item.status}` },
        h(
          'div',
          { className: 'pb-item-head' },
          h(
            'select',
            {
              className: `pb-status pb-s-${item.status}`,
              value: item.status,
              disabled,
              'aria-label': t('statusTodo'),
              onChange: (event) => onPatch({ status: event.target.value }),
            },
            STATUS_KEYS.map((status) =>
              h('option', { key: status, value: status }, statusLabel(t, status)),
            ),
          ),
          h(EditableText, {
            value: item.title,
            placeholder: t('titlePh'),
            disabled,
            className: 'pb-input pb-title-input',
            ariaLabel: t('titlePh'),
            onCommit: (value) => onPatch({ title: value }),
          }),
          h(PercentEditor, {
            value: item.percent,
            disabled,
            label: t('percent'),
            onCommit: (value) => onPatch({ percent: value }),
          }),
          h(
            'div',
            { className: 'pb-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'pb-btn pb-icon-btn',
                title: t('moveUp'),
                'aria-label': t('moveUp'),
                disabled: disabled || !canMoveUp,
                onClick: () => onMove(-1),
              },
              '↑',
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'pb-btn pb-icon-btn',
                title: t('moveDown'),
                'aria-label': t('moveDown'),
                disabled: disabled || !canMoveDown,
                onClick: () => onMove(1),
              },
              '↓',
            ),
            h(
              'button',
              {
                type: 'button',
                className: `pb-btn pb-icon-btn ${confirmDelete ? 'pb-btn-danger' : ''}`,
                title: confirmDelete ? t('confirmDelete') : t('delete'),
                'aria-label': confirmDelete ? t('confirmDelete') : t('delete'),
                disabled,
                onClick: () => {
                  if (confirmDelete) {
                    setConfirmDelete(false)
                    onRemove()
                  } else {
                    setConfirmDelete(true)
                  }
                },
              },
              confirmDelete ? '!' : '×',
            ),
          ),
        ),
        h(
          'div',
          { className: 'pb-subgrid' },
          h(
            'label',
            null,
            h('span', { className: 'pb-field-label' }, t('current')),
            h(EditableText, {
              value: item.current,
              placeholder: t('currentPh'),
              disabled,
              className: 'pb-input',
              ariaLabel: t('current'),
              onCommit: (value) => onPatch({ current: value }),
            }),
          ),
          h(
            'label',
            null,
            h('span', { className: 'pb-field-label' }, t('next')),
            h(EditableText, {
              value: item.next,
              placeholder: t('nextPh'),
              disabled,
              className: 'pb-input',
              ariaLabel: t('next'),
              onCommit: (value) => onPatch({ next: value }),
            }),
          ),
        ),
        h(
          'label',
          { className: 'pb-approach-label' },
          h('span', { className: 'pb-field-label' }, t('approach')),
          h(EditableText, {
            value: item.approach || '',
            placeholder: t('approachPh'),
            disabled,
            multiline: true,
            className: 'pb-approach',
            ariaLabel: t('approach'),
            onCommit: (value) => onPatch({ approach: value }),
          }),
        ),
        showNote
          ? h(EditableText, {
              value: item.note,
              placeholder: t('notePh'),
              disabled,
              multiline: true,
              className: 'pb-note',
              ariaLabel: t('note'),
              onCommit: (value) => onPatch({ note: value }),
            })
          : null,
        h(
          'div',
          { className: 'pb-meta' },
          h(
            'div',
            { className: 'pb-meta-left' },
            h('span', { className: 'pb-by' }, item.updatedBy === 'user' ? t('you') : t('agent')),
            h('span', null, new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
            h(
              'button',
              {
                type: 'button',
                className: 'pb-note-toggle',
                onClick: () => setShowNote((visible) => !visible),
              },
              showNote ? t('hideNote') : t('addNote'),
            ),
          ),
          h('span', null, `${item.percent}%`),
        ),
      )
    }

    function AddTask({ t, disabled, onAdd }) {
      const [title, setTitle] = useState('')
      const [adding, setAdding] = useState(false)

      const submit = async (event) => {
        event.preventDefault()
        const next = title.trim()
        if (!next || adding) return
        setAdding(true)
        try {
          const ok = await onAdd(next)
          if (ok) setTitle('')
        } finally {
          setAdding(false)
        }
      }

      return h(
        'form',
        { className: 'pb-add', onSubmit: submit },
        h('input', {
          className: 'pb-input',
          type: 'text',
          value: title,
          placeholder: t('addPlaceholder'),
          disabled: disabled || adding,
          'aria-label': t('addPlaceholder'),
          onChange: (event) => setTitle(event.target.value),
        }),
        h(
          'button',
          { className: 'pb-btn pb-btn-primary', type: 'submit', disabled: disabled || adding || !title.trim() },
          adding ? t('adding') : t('add'),
        ),
      )
    }

    function Section({ title, count, hint, children }) {
      return h(
        'section',
        { className: 'pb-section' },
        h(
          'div',
          { className: 'pb-section-head' },
          h('h2', { className: 'pb-section-title' }, title),
          h('span', { className: 'pb-section-count' }, String(count)),
        ),
        hint ? h('p', { className: 'pb-blocked-hint' }, hint) : null,
        h('div', { className: 'pb-list' }, children),
      )
    }

    function useProgressData(sessionId) {
      const [snapshot, setSnapshot] = useState(null)
      const [error, setError] = useState('')
      const [lastSyncAt, setLastSyncAt] = useState(0)
      const [refreshTick, setRefreshTick] = useState(0)
      const sessionRef = useRef(sessionId)

      useEffect(() => {
        if (!sessionId) {
          sessionRef.current = undefined
          setSnapshot(null)
          setError('')
          setLastSyncAt(0)
          return undefined
        }

        const sessionChanged = sessionRef.current !== sessionId
        sessionRef.current = sessionId
        if (sessionChanged) {
          setSnapshot(null)
          setLastSyncAt(0)
        }
        setError('')

        let active = true
        let controller

        const load = async () => {
          if (controller) controller.abort()
          const ownController = (controller = new AbortController())
          try {
            const response = await fetch(
              `${API}/snapshot?sessionId=${encodeURIComponent(sessionId)}`,
              { credentials: 'same-origin', cache: 'no-store', signal: ownController.signal },
            )
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const next = await response.json()
            if (!active) return
            setSnapshot(next)
            setError('')
            setLastSyncAt(Date.now())
          } catch (caught) {
            if (!active || caught?.name === 'AbortError') return
            setError(errorText(caught))
          }
        }

        load()
        const interval = window.setInterval(load, 3000)
        const onVisibility = () => {
          if (document.visibilityState === 'visible') load()
        }
        document.addEventListener('visibilitychange', onVisibility)

        return () => {
          active = false
          window.clearInterval(interval)
          controller?.abort()
          document.removeEventListener('visibilitychange', onVisibility)
        }
      }, [sessionId, refreshTick])

      return {
        snapshot,
        setSnapshot,
        error,
        lastSyncAt,
        refresh: () => setRefreshTick((value) => value + 1),
      }
    }

    function ProgressDock(props) {
      const t = makeT(props)
      const { sessionId } = props
      const { snapshot, error: readError, refresh } = useProgressData(sessionId)
      const [expanded, setExpanded] = useState(false)

      useEffect(() => {
        setExpanded(false)
      }, [sessionId])

      if (!sessionId || !snapshot || !snapshot.items || snapshot.items.length === 0) return null

      const summary = snapshot.summary || { total: 0, done: 0, doing: 0, todo: 0, blocked: 0, percent: 0 }
      const items = snapshot.items
      const doing = items.find((item) => item.status === 'doing')
      const blocked = items.find((item) => item.status === 'blocked')
      const todo = items.find((item) => item.status === "todo")

      let focusLine = t('dockAllDone')
      if (doing) focusLine = `${t('doingTitle')}：${doing.title}`
      else if (blocked) focusLine = `${t('blockedTitle')}：${blocked.title}`
      else if (todo) focusLine = `${t('dockNext')}：${todo.title}`

      const sub = [`${summary.done}/${summary.total} ${t('doneCount')}`]
      if (summary.blocked) sub.push(`${summary.blocked} ${t('blockedCount')}`)
      if (snapshot.pendingUserChanges) sub.push(`${snapshot.pendingUserChanges} ${t('dockPending')}`)
      if (readError) sub.push(t('syncFailed'))
      sub.push(t('dockHint'))

      const openPanel = () => {
        try {
          props.openPanel?.()
        } catch (_error) {
          // The full panel remains reachable from the sidebar.
        }
      }

      const togglePanel = () => {
        try {
          props.togglePanel?.()
        } catch (_error) {
          // The right sidebar chrome remains available.
        }
      }

      const priority = { doing: 0, blocked: 1, todo: 2, done: 3 }
      const ordered = items
        .slice()
        .sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9) || a.order - b.order)
        .slice(0, 8)

      return h(
        React.Fragment,
        null,
        h('style', null, CSS),
        h(
          'div',
          { className: 'pb-dock-wrap' },
          h(
            'div',
            { className: 'pb-dock' },
            h(
              'div',
              { className: 'pb-dock-row' },
            h(
              'button',
              {
                type: 'button',
                className: 'pb-dock-main',
                title: t('dockHint'),
                onClick: togglePanel,
              },
              h('span', { className: 'pb-dock-percent' }, `${summary.percent}%`),
              h('span', { className: 'pb-dock-bar' }, h('i', { style: { width: `${summary.percent}%` } })),
              h(
                'span',
                { className: 'pb-dock-body' },
                h('span', { className: 'pb-dock-title' }, focusLine),
                h('span', { className: 'pb-dock-sub' }, sub.join(' · ')),
              ),
            ),
            h(
              'div',
              { className: 'pb-dock-actions' },
              readError
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'pb-dock-btn',
                      title: t('refresh'),
                      'aria-label': t('refresh'),
                      onClick: refresh,
                    },
                    '↻',
                  )
                : null,
              h(
                'button',
                {
                  type: 'button',
                  className: 'pb-dock-btn',
                  onClick: () => setExpanded((value) => !value),
                },
                expanded ? t('dockCollapse') : t('dockExpand'),
              ),
              h(
                'button',
                { type: 'button', className: 'pb-dock-btn', onClick: openPanel },
                t('dockEdit'),
              ),
            ),
          ),
          expanded
            ? h(
                'div',
                { className: 'pb-dock-expanded' },
                ordered.map((item) =>
                  h(
                    'div',
                    { key: item.id, className: 'pb-dock-item' },
                    h('i', { className: `pb-dock-dot ${item.status}` }),
                    h('span', { className: 'pb-dock-item-title' }, item.title),
                    h('span', { className: 'pb-dock-item-meta' }, `${item.percent}%`),
                  ),
                ),
                h(
                  'button',
                  { type: 'button', className: 'pb-dock-more', onClick: openPanel },
                  t('dockOpenFull'),
                ),
              )
            : null,
          ),
        ),
      )
    }

    function SideTaskEditor({ item, t, disabled, onPatch }) {
      const [showNote, setShowNote] = useState(Boolean(item.note))
      useEffect(() => {
        if (item.note) setShowNote(true)
      }, [item.note])

      return h(
        'div',
        { className: 'pb-side-card' },
        h(
          'div',
          { className: 'pb-side-task-head' },
          h(
            'select',
            {
              className: `pb-status pb-s-${item.status}`,
              value: item.status,
              disabled,
              'aria-label': t('statusTodo'),
              onChange: (event) => onPatch({ status: event.target.value }),
            },
            STATUS_KEYS.map((status) => h('option', { key: status, value: status }, statusLabel(t, status))),
          ),
          h(EditableText, {
            value: item.title,
            placeholder: t('titlePh'),
            disabled,
            className: 'pb-side-input',
            ariaLabel: t('titlePh'),
            onCommit: (value) => onPatch({ title: value }),
          }),
          h(PercentEditor, {
            value: item.percent,
            disabled,
            label: t('percent'),
            onCommit: (value) => onPatch({ percent: value }),
          }),
        ),
        h('div', { className: 'pb-side-bar' }, h('i', { style: { width: `${item.percent}%` } })),
        h(
          'label',
          { className: 'pb-side-field' },
          h('span', { className: 'pb-field-label' }, t('current')),
          h(EditableText, {
            value: item.current,
            placeholder: t('currentPh'),
            disabled,
            className: 'pb-side-input',
            ariaLabel: t('current'),
            onCommit: (value) => onPatch({ current: value }),
          }),
        ),
        h(
          'label',
          { className: 'pb-side-field' },
          h('span', { className: 'pb-field-label' }, t('approach')),
          h(EditableText, {
            value: item.approach || '',
            placeholder: t('approachPh'),
            disabled,
            multiline: true,
            className: 'pb-side-textarea',
            ariaLabel: t('approach'),
            onCommit: (value) => onPatch({ approach: value }),
          }),
        ),
        h(
          'label',
          { className: 'pb-side-field' },
          h('span', { className: 'pb-field-label' }, t('next')),
          h(EditableText, {
            value: item.next,
            placeholder: t('nextPh'),
            disabled,
            className: 'pb-side-input',
            ariaLabel: t('next'),
            onCommit: (value) => onPatch({ next: value }),
          }),
        ),
        showNote
          ? h(EditableText, {
              value: item.note,
              placeholder: t('notePh'),
              disabled,
              multiline: true,
              className: 'pb-side-textarea',
              ariaLabel: t('note'),
              onCommit: (value) => onPatch({ note: value }),
            })
          : h(
              'button',
              {
                type: 'button',
                className: 'pb-side-link',
                style: { marginTop: '6px' },
                onClick: () => setShowNote(true),
              },
              t('addNote'),
            ),
      )
    }

    function ProgressSidePanel(props) {
      const t = makeT(props)
      const { sessionId } = props
      const useTabInfo = props.useTabInfo
      const tabInfo = useTabInfo ? useTabInfo() : undefined
      const { snapshot, setSnapshot, error: readError, lastSyncAt, refresh } = useProgressData(sessionId)
      const [saving, setSaving] = useState(false)
      const [actionError, setActionError] = useState('')
      const revisionRef = useRef(0)

      useEffect(() => {
        if (!sessionId) return undefined
        setPanelActive(sessionId, true)
        return () => setPanelActive(sessionId, false)
      }, [sessionId])

      useEffect(() => {
        revisionRef.current = snapshot?.revision ?? 0
      }, [snapshot?.revision])

      const mutate = useCallback(
        async (changes) => {
          if (!sessionId) return false
          setSaving(true)
          setActionError('')
          try {
            let result = await postChanges(sessionId, revisionRef.current, changes)
            if (result.response.status === 409 && result.body?.snapshot) {
              revisionRef.current = result.body.snapshot.revision
              setSnapshot(result.body.snapshot)
              result = await postChanges(sessionId, revisionRef.current, changes)
            }
            const { response, body } = result
            if (!response.ok || !body || body.ok === false) {
              if (body?.snapshot) {
                revisionRef.current = body.snapshot.revision
                setSnapshot(body.snapshot)
              }
              throw new Error(body?.error || `HTTP ${response.status}`)
            }
            revisionRef.current = body.revision
            setSnapshot(body)
            const addedTitles = (Array.isArray(changes) ? changes : [])
              .filter((change) => change && !change.id && !change.remove && typeof change.title === 'string')
              .map((change) => change.title.trim())
              .filter(Boolean)
            if (addedTitles.length > 0) {
              props.wakeAgent?.(
                sessionId,
                `我在进度板新增了任务。请按新任务推进。`,
              )
            }
            return true
          } catch (caught) {
            setActionError(errorText(caught))
            return false
          } finally {
            setSaving(false)
          }
        },
        [sessionId, setSnapshot],
      )

      const collapse = () => {
        try {
          props.collapse?.()
        } catch (_error) {
          // The chrome control remains available.
        }
      }

      const openFull = () => {
        try {
          props.openFullPanel?.()
        } catch (_error) {
          // The sidebar icon remains available.
        }
      }

      const items = snapshot?.items || []
      const latestDone = items
        .filter((item) => item.status === 'done')
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)[0]
      const otherDone = items
        .filter((item) => item.status === 'done' && item.id !== latestDone?.id)
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
      const current = items.find((item) => item.status === 'doing') || items.find((item) => item.status === 'blocked')
      const pending = items.filter(
        (item) => (item.status === 'todo' || item.status === 'blocked') && item.id !== current?.id,
      )

      if (!sessionId) {
        return h(
          'div',
          { className: 'pb-side' },
          h('style', null, CSS),
          h('div', { className: 'pb-side-empty' }, t('noSessionBody')),
        )
      }

      return h(
        React.Fragment,
        null,
        h('style', null, CSS),
        h(
          'div',
          { className: 'pb-side' },
          h(
            'div',
            { className: 'pb-side-head' },
            h(
              'div',
              null,
              h('h2', { className: 'pb-side-title' }, t('nav')),
              h('p', { className: 'pb-side-sub' }, t('subtitle')),
            ),
            h(
              'div',
              { className: 'pb-side-head-actions' },
              h(
                'button',
                { type: 'button', className: 'pb-btn', onClick: () => props.toggleFullscreen?.() },
                tabInfo?.sidebar?.fullscreen ? t('sideHalf') : t('sideFull'),
              ),
              h('button', { type: 'button', className: 'pb-btn', onClick: collapse }, t('sideCollapse')),
            ),
          ),
          readError ? h('div', { className: 'pb-side-error' }, `${t('readError')}${readError}`) : null,
          actionError ? h('div', { className: 'pb-side-error' }, `${t('saveError')}${actionError}`) : null,
          !snapshot
            ? h('div', { className: 'pb-loading' }, t('loading'))
            : h(
                React.Fragment,
                null,
                h(
                  'section',
                  { className: 'pb-side-section' },
                  h(
                    'div',
                    { className: 'pb-side-label' },
                    h('span', null, t('sideCompleted')),
                    h('span', null, `${items.filter((item) => item.status === 'done').length}`),
                  ),
                  latestDone
                    ? h(
                        'div',
                        { className: 'pb-side-card pb-side-done-card' },
                        h(
                          'div',
                          { className: 'pb-side-task-head' },
                          h('span', { className: 'pb-side-check' }, '✓'),
                          h('span', { className: 'pb-side-done-title' }, latestDone.title),
                          h('span', { className: 'pb-side-meta' }, '100%'),
                        ),
                        latestDone.approach
                          ? h(
                              'div',
                              { className: 'pb-side-detail-line' },
                              h('b', null, t('approach')),
                              `：${latestDone.approach}`,
                            )
                          : null,
                        latestDone.note ? h('p', { className: 'pb-side-note' }, latestDone.note) : null,
                        h(
                          'div',
                          { className: 'pb-side-detail-line' },
                          `${t('lastUpdate')} ${new Date(latestDone.updatedAt).toLocaleString()}`,
                        ),
                      )
                    : h('div', { className: 'pb-side-empty' }, t('sideEmptyDone')),
                  otherDone.length
                    ? h(
                        'details',
                        { className: 'pb-side-done-all' },
                        h('summary', null, `${t('sideAllDone')} (${otherDone.length})`),
                        otherDone.map((item) =>
                          h(
                            'details',
                            { key: item.id, className: 'pb-side-done-item' },
                            h(
                              'summary',
                              null,
                              h('span', { className: 'pb-side-check' }, '✓'),
                              h('span', { className: 'pb-side-done-title' }, item.title),
                              h('span', { className: 'pb-side-meta' }, '100%'),
                            ),
                            item.approach
                              ? h(
                                  'div',
                                  { className: 'pb-side-detail-line' },
                                  h('b', null, t('approach')),
                                  `：${item.approach}`,
                                )
                              : null,
                            item.note ? h('p', { className: 'pb-side-note' }, item.note) : null,
                            h(
                              'div',
                              { className: 'pb-side-detail-line' },
                              `${t('lastUpdate')} ${new Date(item.updatedAt).toLocaleString()}`,
                            ),
                          ),
                        ),
                      )
                    : null,
                ),
                h(
                  'section',
                  { className: 'pb-side-section' },
                  h(
                    'div',
                    { className: 'pb-side-label' },
                    h('span', null, t('sideDetails')),
                    current ? h('span', null, `${current.percent}%`) : null,
                  ),
                  current
                    ? h(SideTaskEditor, {
                        key: current.id,
                        item: current,
                        t,
                        disabled: saving,
                        onPatch: (fields) => mutate([{ id: current.id, ...fields }]),
                      })
                    : h('div', { className: 'pb-side-empty' }, t('noDoing')),
                ),
                h(
                  'section',
                  { className: 'pb-side-section' },
                  h(
                    'div',
                    { className: 'pb-side-label' },
                    h('span', null, t('sidePending')),
                    h('span', null, `${pending.length}`),
                  ),
                  pending.length
                    ? pending.map((item) =>
                        h(SideTaskEditor, {
                          key: item.id,
                          item,
                          t,
                          disabled: saving,
                          onPatch: (fields) => mutate([{ id: item.id, ...fields }]),
                        }),
                      )
                    : h('div', { className: 'pb-side-empty' }, t('sideEmptyPending')),
                ),
                h(AddTask, {
                  t,
                  disabled: saving,
                  onAdd: (title) =>
                    mutate([{ title, status: 'todo', percent: 0, current: '', next: '', approach: '', note: '' }]),
                }),
                h(
                  'footer',
                  { className: 'pb-side-footer' },
                  h('button', { type: 'button', className: 'pb-side-link', onClick: openFull }, t('sideOpenFull')),
                  h('button', { type: 'button', className: 'pb-side-link', onClick: refresh }, t('refresh')),
                  h('span', null, `${t('revision')} ${snapshot.revision}`),
                  h(
                    'span',
                    null,
                    `${t('lastSync')} ${
                      lastSyncAt
                        ? new Date(lastSyncAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : '—'
                    }`,
                  ),
                  h('span', null, snapshot.persistent ? t('saved') : t('memoryOnly')),
                ),
              ),
        ),
      )
    }

    function ProgressPanel(props) {
      const t = makeT(props)
      const sessionId = props.useSessions
        ? props.useSessions((state) => {
            const rows = Object.values(state.byId || {})
            const current = rows.find((row) => (row.retainedBy?.mainView ?? 0) > 0)
            return current?.id
          })
        : undefined

      const [snapshot, setSnapshot] = useState(null)
      const [loading, setLoading] = useState(true)
      const [saving, setSaving] = useState(false)
      const [loadError, setLoadError] = useState('')
      const [actionError, setActionError] = useState('')
      const [tick, setTick] = useState(0)
      const revisionRef = useRef(0)

      useEffect(() => {
        revisionRef.current = snapshot?.revision ?? 0
      }, [snapshot?.revision])

      useEffect(() => {
        if (!sessionId) {
          setSnapshot(null)
          setLoading(false)
          return undefined
        }

        let active = true
        let controller
        setLoading(true)

        const load = async () => {
          if (controller) controller.abort()
          const ownController = (controller = new AbortController())
          try {
            const response = await fetch(
              `${API}/snapshot?sessionId=${encodeURIComponent(sessionId)}`,
              { credentials: 'same-origin', cache: 'no-store', signal: ownController.signal },
            )
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const next = await response.json()
            if (!active) return
            revisionRef.current = next.revision
            setSnapshot(next)
            setLoadError('')
            setLoading(false)
          } catch (error) {
            if (!active || error?.name === 'AbortError') return
            setLoadError(errorText(error))
            setLoading(false)
          }
        }

        load()
        const interval = window.setInterval(load, 3000)
        const onVisibility = () => {
          if (document.visibilityState === 'visible') load()
        }
        document.addEventListener('visibilitychange', onVisibility)

        return () => {
          active = false
          window.clearInterval(interval)
          controller?.abort()
          document.removeEventListener('visibilitychange', onVisibility)
        }
      }, [sessionId, tick])

      const mutate = useCallback(
        async (changes) => {
          if (!sessionId) return false
          setSaving(true)
          setActionError('')
          try {
            let result = await postChanges(sessionId, revisionRef.current, changes)
            if (result.response.status === 409 && result.body?.snapshot) {
              revisionRef.current = result.body.snapshot.revision
              setSnapshot(result.body.snapshot)
              result = await postChanges(sessionId, revisionRef.current, changes)
            }
            const { response, body } = result
            if (!response.ok || !body || body.ok === false) {
              if (body?.snapshot) {
                revisionRef.current = body.snapshot.revision
                setSnapshot(body.snapshot)
              }
              throw new Error(body?.error || `HTTP ${response.status}`)
            }
            revisionRef.current = body.revision
            setSnapshot(body)
            const addedTitles = (Array.isArray(changes) ? changes : [])
              .filter((change) => change && !change.id && !change.remove && typeof change.title === 'string')
              .map((change) => change.title.trim())
              .filter(Boolean)
            if (addedTitles.length > 0) {
              props.wakeAgent?.(
                sessionId,
                `我在进度板新增了任务${addedTitles.map((title) => `「${title}」`).join('、')}。请按新任务推进。`,
              )
            }
            return true
          } catch (error) {
            setActionError(errorText(error))
            return false
          } finally {
            setSaving(false)
          }
        },
        [sessionId],
      )

      const patch = useCallback(
        (item, fields) => mutate([{ id: item.id, ...fields }]),
        [mutate],
      )

      const items = snapshot?.items || []
      const summary = snapshot?.summary || { total: 0, done: 0, doing: 0, todo: 0, blocked: 0, percent: 0 }
      const doing = items.filter((item) => item.status === 'doing')
      const todo = items.filter((item) => item.status === 'todo')
      const blocked = items.filter((item) => item.status === 'blocked')
      const done = items.filter((item) => item.status === 'done')

      const move = (item, direction) => {
        const index = items.findIndex((candidate) => candidate.id === item.id)
        const neighbor = items[index + direction]
        if (!neighbor) return
        mutate([
          { id: item.id, order: neighbor.order },
          { id: neighbor.id, order: item.order },
        ])
      }

      const renderItem = (item) => {
        const index = items.findIndex((candidate) => candidate.id === item.id)
        return h(ItemCard, {
          key: item.id,
          item,
          t,
          disabled: saving,
          canMoveUp: index > 0,
          canMoveDown: index >= 0 && index < items.length - 1,
          onPatch: (fields) => patch(item, fields),
          onRemove: () => mutate([{ id: item.id, remove: true }]),
          onMove: (direction) => move(item, direction),
        })
      }

      if (!sessionId) {
        return h(
          'div',
          { className: 'pb-root' },
          h('style', null, CSS),
          h(
            'div',
            { className: 'pb-inner' },
            h(
              'header',
              { className: 'pb-head' },
              h(
                'div',
                null,
                h('h1', { className: 'pb-title' }, t('title')),
                h('p', { className: 'pb-sub' }, t('subtitle')),
              ),
            ),
            h(
              'div',
              { className: 'pb-empty' },
              h('h2', null, t('noSessionTitle')),
              h('p', null, t('noSessionBody')),
            ),
          ),
        )
      }

      const focus = doing[0] || null
      const updated = snapshot ? new Date(snapshot.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

      return h(
        'div',
        { className: 'pb-root' },
        h('style', null, CSS),
        h(
          'div',
          { className: 'pb-inner' },
          h(
            'header',
            { className: 'pb-head' },
            h(
              'div',
              null,
              h('h1', { className: 'pb-title' }, t('title')),
              h('p', { className: 'pb-sub' }, t('subtitle')),
            ),
            h(
              'div',
              { className: 'pb-head-right' },
              saving ? h('span', { className: 'pb-saving' }, t('saving')) : null,
              snapshot?.pendingUserChanges
                ? h('span', { className: 'pb-badge-pending' }, `${t('pending')} · ${snapshot.pendingUserChanges}`)
                : null,
              h(
                'span',
                { className: 'pb-live', title: t('footerHint') },
                h('i', { className: 'pb-dot' }),
                t('live'),
              ),
            ),
          ),
          loadError
            ? h(
                'div',
                { className: 'pb-warn pb-warn-error' },
                `${t('readError')}${loadError} `,
                h(
                  'button',
                  { type: 'button', className: 'pb-btn', onClick: () => setTick((value) => value + 1) },
                  t('retry'),
                ),
              )
            : null,
          actionError
            ? h(
                'div',
                { className: 'pb-warn pb-warn-error' },
                `${t('saveError')}${actionError}`,
              )
            : null,
          snapshot?.storageError
            ? h('div', { className: 'pb-warn' }, `${t('storageWarn')} ${snapshot.storageError}`)
            : null,
          loading && !snapshot
            ? h('div', { className: 'pb-loading' }, t('loading'))
            : h(
                React.Fragment,
                null,
                h(
                  'section',
                  { className: 'pb-overview' },
                  h(
                    'div',
                    { className: 'pb-overview-top' },
                    h(
                      'div',
                      { className: 'pb-big' },
                      String(summary.percent),
                      h('small', null, '%'),
                    ),
                    h(
                      'div',
                      { className: 'pb-counts' },
                      h('span', { className: 'pb-chip' }, t('statusDone'), h('strong', null, summary.done)),
                      h('span', { className: 'pb-chip' }, t('statusDoing'), h('strong', null, summary.doing)),
                      h('span', { className: 'pb-chip' }, t('statusTodo'), h('strong', null, summary.todo)),
                      h('span', { className: 'pb-chip' }, t('statusBlocked'), h('strong', null, summary.blocked)),
                    ),
                  ),
                  h('div', { className: 'pb-bar' }, h('i', { style: { width: `${summary.percent}%` } })),
                  h(
                    'div',
                    { className: 'pb-focus' },
                    focus
                      ? h(
                          React.Fragment,
                          null,
                          h('span', null, `${t('doingTitle')}：`),
                          h('b', null, focus.title),
                          focus.current ? h('span', null, ` · ${focus.current}`) : null,
                        )
                      : h('span', null, summary.total > 0 && summary.done === summary.total ? t('allDone') : t('noDoing')),
                    summary.blocked > 0 ? h('span', { className: 'pb-badge-pending' }, `${summary.blocked} ${t('blockedCount')}`) : null,
                  ),
                ),
                snapshot?.items?.length === 0
                  ? h(
                      'div',
                      { className: 'pb-empty' },
                      h('h2', null, t('emptyTitle')),
                      h('p', null, t('emptyBody')),
                    )
                  : h(
                      React.Fragment,
                      null,
                      doing.length
                        ? h(Section, { title: t('doingTitle'), count: doing.length }, doing.map(renderItem))
                        : h(
                            'section',
                            { className: 'pb-section' },
                            h('p', { className: 'pb-loading', style: { padding: '14px 0' } }, t('emptyDoing')),
                          ),
                      todo.length
                        ? h(Section, { title: t('todoTitle'), count: todo.length }, todo.map(renderItem))
                        : null,
                      blocked.length
                        ? h(
                            Section,
                            { title: t('blockedTitle'), count: blocked.length, hint: t('blockedHint') },
                            blocked.map(renderItem),
                          )
                        : null,
                      done.length
                        ? h(
                            'details',
                            { className: 'pb-done-box' },
                            h('summary', null, `${t('doneTitle')} · ${done.length} ${t('doneCount')}`),
                            h('div', { className: 'pb-list' }, done.map(renderItem)),
                          )
                        : null,
                    ),
                h(AddTask, {
                  t,
                  disabled: saving,
                  onAdd: (title) =>
                    mutate([{ title, status: 'todo', percent: 0, current: '', next: '', approach: '', note: '' }]),
                }),
                h(
                  'footer',
                  { className: 'pb-footer' },
                  h('span', null, `${t('editHint')}`),
                  h('span', { className: 'pb-sep' }, '·'),
                  h('span', null, `${t('footerHint')}`),
                  h('span', { className: 'pb-sep' }, '·'),
                  h('span', null, `${t('lastUpdate')} ${updated}`),
                  h('span', null, `${t('revision')} ${snapshot?.revision ?? 0}`),
                  h('span', null, snapshot?.persistent ? t('saved') : t('memoryOnly')),
                ),
              ),
        ),
      )
    }

    return {
      inject: ['slots', 'locale', 'layout', 'sidebarRight', 'sidebarRightTabs', 'sessions'],
      apply(ctx) {
        ctx.effect(
          () =>
            ctx.locale.register(NS, {
              zh,
              en,
            }),
          'progress-board: locale',
        )

        const t = ctx.locale.bind(NS)
        const wakeAgent = (sessionId, text) => {
          try {
            const binding = ctx.sessions.binding(sessionId)
            if (!binding) return
            binding.session.prompt([{ type: 'text', text }], 'queue').catch(() => {})
          } catch (_error) {
            // The task is saved; waking is best-effort.
          }
        }
        const openPanel = () => ctx.sidebarRight.openTab(RIGHT_TAB_KIND)
        const togglePanel = () => {
          const active = ctx.sidebarRight.active()
          if (ctx.sidebarRight.isExpanded() && active?.kind === RIGHT_TAB_KIND) {
            ctx.sidebarRight.toggleExpanded()
            return
          }
          ctx.sidebarRight.openTab(RIGHT_TAB_KIND)
        }
        const openFullPanel = () => ctx.layout.selectPanel(PANEL_ID)
        const toggleFullscreen = () => {
          const target = ctx.sidebarRight.focusedTarget() ?? ctx.sidebarRight.commandTarget()
          if (target) ctx.sidebarRight.toggleFullscreen(target)
        }

        ctx.effect(
          () =>
            ctx.sidebarRightTabs.register({
              id: RIGHT_TAB_ID,
              kind: RIGHT_TAB_KIND,
              priority: 'extension',
              title: () => t('nav'),
            }),
          'progress-board: right sidebar type',
        )

        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.right.pane.tab', () =>
              ctx.slots.register(
                {
                  name: 'sidebar.right.pane.tab',
                  key: RIGHT_TAB_ID,
                  locale: NS,
                  inject: () => ({
                    collapse: () => ctx.sidebarRight.toggleExpanded(),
                    toggleFullscreen,
                    openFullPanel,
                    wakeAgent,
                  }),
                },
                ProgressSidePanel,
              ),
            ),
          'progress-board: right sidebar body',
        )

        ctx.effect(
          () =>
            ctx.slots.inject('main', () =>
              ctx.slots.register(
                {
                  name: 'main',
                  key: PANEL_ID,
                  locale: NS,
                  inject: () => ({ wakeAgent }),
                },
                ProgressPanel,
              ),
            ),
          'progress-board: full panel',
        )

        ctx.effect(
          () =>
            ctx.slots.inject('conversation.session.header.utilities', () =>
              ctx.slots.register(
                {
                  name: 'conversation.session.header.utilities',
                  id: 'progress-board-header',
                  order: 12,
                  locale: NS,
                  inject: () => ({ openPanel: togglePanel }),
                },
                ProgressHeaderButton,
              ),
            ),
          'progress-board: header button',
        )

        ctx.effect(
          () =>
            ctx.slots.inject('conversation.input.dock', () =>
              ctx.slots.register(
                {
                  name: 'conversation.input.dock',
                  id: 'progress-board-dock',
                  order: 5,
                  locale: NS,
                  inject: () => ({ openPanel, togglePanel }),
                },
                ProgressDock,
              ),
            ),
          'progress-board: composer dock',
        )
      },
    }
  },
})
