import type {
  IconCraftEvent,
  IconCraftEventType,
  IconCraftEventHandler,
  IconCraftEventFilter,
  IconCraftDispatcher,
} from './types';

type Subscription = {
  filter: IconCraftEventFilter;
  eventTypes: Set<IconCraftEventType> | '*';
  handler: IconCraftEventHandler;
};

/**
 * イベントディスパッチャーの作成
 */
export function createDispatcher(): IconCraftDispatcher {
  const subscriptions = new Set<Subscription>();

  const dispatch = (event: IconCraftEvent): void => {
    for (const sub of subscriptions) {
      // フィルターチェック（'*' または特定のID）
      if (sub.filter !== '*' && sub.filter !== event.id) {
        continue;
      }

      // イベントタイプチェック
      if (sub.eventTypes !== '*' && !sub.eventTypes.has(event.type)) {
        continue;
      }

      // ハンドラー呼び出し
      try {
        sub.handler(event);
      } catch (err) {
        console.error('[IconCraft] Event handler error:', err);
      }
    }
  };

  const subscribe = (
    filter: IconCraftEventFilter,
    eventType: IconCraftEventType | IconCraftEventType[] | '*',
    handler: IconCraftEventHandler
  ): (() => void) => {
    const eventTypes: Set<IconCraftEventType> | '*' =
      eventType === '*'
        ? '*'
        : new Set(Array.isArray(eventType) ? eventType : [eventType]);

    const subscription: Subscription = {
      filter,
      eventTypes,
      handler,
    };

    subscriptions.add(subscription);

    // Unsubscribe function
    return () => {
      subscriptions.delete(subscription);
    };
  };

  return { dispatch, subscribe };
}
