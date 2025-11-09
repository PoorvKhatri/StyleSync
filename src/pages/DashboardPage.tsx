import { useState, useEffect } from 'react';
import { User, Award, ShoppingBag, Heart, Trophy, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SavedOutfit, Order, Product } from '../lib/supabase';

export const DashboardPage = () => {
  const { profile } = useAuth();
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'outfits' | 'orders' | 'leaderboard'>('outfits');

  useEffect(() => {
    if (profile) {
      fetchSavedOutfits();
      fetchOrders();
      fetchLeaderboard();
    }
  }, [profile]);

  const fetchSavedOutfits = async () => {
    const { data } = await supabase
      .from('saved_outfits')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) setSavedOutfits(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, style_score, avatar_url')
      .order('style_score', { ascending: false })
      .limit(10);

    if (data) setLeaderboard(data);
  };

  const deleteOutfit = async (id: string) => {
    const { error } = await supabase.from('saved_outfits').delete().eq('id', id);
    if (!error) {
      setSavedOutfits(savedOutfits.filter((o) => o.id !== id));
    }
  };

  const tabs = [
    { id: 'outfits', label: 'Saved Outfits', icon: Heart },
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'leaderboard', label: 'Style Leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile?.full_name || 'Fashion Enthusiast'}
              </h1>
              <p className="text-gray-400">{profile?.email}</p>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-xl p-6 border border-cyan-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-gray-400 text-sm">Style Score</p>
                  <p className="text-3xl font-bold text-white">{profile?.style_score || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:text-cyan-400 border border-cyan-500/20'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'outfits' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Saved Outfits</h2>

            {savedOutfits.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">No saved outfits yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Use the AI Stylist to create and save outfits
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {savedOutfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="bg-gray-900/50 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold mb-1">{outfit.outfit_name}</h3>
                        <p className="text-gray-400 text-sm capitalize">{outfit.event_type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-cyan-500/20 px-3 py-1 rounded-full">
                          <span className="text-cyan-400 font-bold">{outfit.ai_score}</span>
                        </div>
                        <button
                          onClick={() => deleteOutfit(outfit.id)}
                          className="p-2 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {outfit.product_ids.length} items • Created{' '}
                      {new Date(outfit.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">No orders yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Start shopping to see your order history
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-900/50 border border-cyan-500/20 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">${order.total_amount}</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm ${
                            order.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : order.status === 'shipped'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Top Stylists</h2>

            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    user.id === profile?.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border-2 border-cyan-400'
                      : 'bg-gray-900/50 border border-cyan-500/20'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-yellow-500 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-300 text-gray-800'
                        : index === 2
                        ? 'bg-orange-600 text-orange-100'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>

                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {user.full_name || 'Anonymous'}
                      {user.id === profile?.id && (
                        <span className="text-cyan-400 text-sm ml-2">(You)</span>
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">{user.style_score}</p>
                    <p className="text-gray-500 text-sm">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
