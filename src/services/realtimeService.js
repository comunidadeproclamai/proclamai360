import { supabase } from '../lib/supabaseClient';

class RealtimeService {
  constructor() {
    this.channels = new Map();
  }

  /**
   * Inscreve-se em eventos de inserção em uma tabela específica
   */
  subscribeToInserts(table, callback) {
    if (!supabase) return null;

    const channelName = `public:${table}:inserts`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Inscreve-se em eventos de atualizacao em uma tabela específica
   */
  subscribeToUpdates(table, callback) {
    if (!supabase) return null;

    const channelName = `public:${table}:updates`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Remove subscrição
   */
  unsubscribe(channel) {
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.forEach((ch, name) => {
        if (ch === channel) this.channels.delete(name);
      });
    }
  }
}

export const realtimeService = new RealtimeService();
