import { useState, useEffect } from 'react';
import { Sparkles, Save, Award } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { additionalProducts } from '../lib/products';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export const StylistPage = () => {
  const [eventType, setEventType] = useState('casual');
  const [generatedOutfit, setGeneratedOutfit] = useState<Product[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outfitScore, setOutfitScore] = useState<number | null>(null);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const eventTypes = [
    { value: 'casual', label: 'Casual Hangout', emoji: '👕' },
    { value: 'office', label: 'Office/Professional', emoji: '💼' },
    { value: 'party', label: 'Party/Night Out', emoji: '🎉' },
    { value: 'formal', label: 'Formal Event', emoji: '🎩' },
    { value: 'summer', label: 'Summer Day', emoji: '☀️' },
    { value: 'winter', label: 'Winter Cozy', emoji: '❄️' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts([...data, ...additionalProducts]);
  };

  const generateOutfit = () => {
    setIsGenerating(true);
    setShowScoreAnimation(false);

    setTimeout(() => {
      const eventTags: Record<string, string[]> = {
        casual: ['casual', 'everyday', 'comfortable'],
        office: ['office', 'professional', 'formal'],
        party: ['party', 'evening', 'trendy'],
        formal: ['formal', 'elegant'],
        summer: ['summer', 'lightweight'],
        winter: ['winter', 'cozy'],
      };

      const relevantTags = eventTags[eventType] || [];
      const matchingProducts = products.filter((p) =>
        p.tags.some((tag) => relevantTags.includes(tag))
      );

      const selectedProducts = matchingProducts.length >= 3
        ? matchingProducts.slice(0, 3)
        : products.slice(0, 3);

      setGeneratedOutfit(selectedProducts);

      const score = Math.floor(Math.random() * 15) + 85;
      setOutfitScore(score);

      setIsGenerating(false);
      setShowScoreAnimation(true);
    }, 2000);
  };

  const saveOutfit = async () => {
    if (!user || generatedOutfit.length === 0) {
      alert('Please login and generate an outfit first');
      return;
    }

    const { error } = await supabase.from('saved_outfits').insert({
      user_id: user.id,
      outfit_name: `${eventType} outfit - ${new Date().toLocaleDateString()}`,
      product_ids: generatedOutfit.map((p) => p.id),
      ai_score: outfitScore || 0,
      event_type: eventType,
    });

    if (error) {
      alert('Error saving outfit');
    } else {
      alert('Outfit saved successfully!');
    }
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-4">
            AI Outfit Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Let AI create the perfect outfit for any occasion
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Select Event Type
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setEventType(type.value)}
                className={`p-6 rounded-xl transition-all ${
                  eventType === type.value
                    ? 'bg-gradient-to-r from-cyan-500/30 to-pink-500/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30'
                    : 'bg-gray-900/50 border border-cyan-500/20 hover:border-cyan-500/50'
                }`}
              >
                <div className="text-4xl mb-2">{type.emoji}</div>
                <div className="text-white font-semibold">{type.label}</div>
              </button>
            ))}
          </div>

          <button
            onClick={generateOutfit}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Perfect Outfit...
              </div>
            ) : (
              <>
                <Sparkles className="inline w-5 h-5 mr-2" />
                Generate AI Outfit
              </>
            )}
          </button>
        </div>

        {generatedOutfit.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Your Perfect Outfit</h2>
              {outfitScore && showScoreAnimation && (
                <div className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-xl p-4 border border-cyan-500/30 animate-bounce">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Style Score</p>
                      <p className="text-3xl font-bold text-white">{outfitScore}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {generatedOutfit.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-900/50 rounded-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all group"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                    <p className="text-cyan-400 font-bold mb-3">₹{product.price}</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={saveOutfit}
                className="flex-1 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
              >
                <Save className="inline w-5 h-5 mr-2" />
                Save Outfit
              </button>
              <button
                onClick={generateOutfit}
                className="flex-1 py-3 rounded-lg bg-pink-500/20 text-pink-400 font-semibold border border-pink-500/30 hover:bg-pink-500/30 transition-all"
              >
                <Sparkles className="inline w-5 h-5 mr-2" />
                Generate New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
