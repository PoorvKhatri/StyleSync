import { useState, useRef } from 'react';
import { Upload, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [styleScore, setStyleScore] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCart();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      setUploadedImage(imageUrl);
      setIsAnalyzing(true);

      setTimeout(async () => {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .limit(4);

        setRecommendations(products || []);
        const randomScore = Math.floor(Math.random() * 20) + 80;
        setStyleScore(randomScore);
        setIsAnalyzing(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'AI Style Analysis',
      description: 'Upload your photo and let AI suggest perfect outfits',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Trend Predictions',
      description: 'Stay ahead with AI-powered fashion trends',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Virtual Try-On',
      description: 'See how clothes look on you before buying',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-pink-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Sync Your Style with AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Discover your perfect look with AI-powered fashion recommendations tailored to your unique style
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
            >
              <Upload className="inline w-5 h-5 mr-2" />
              Upload Your Selfie
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-cyan-500/30 text-white font-semibold hover:bg-white/20 transition-all transform hover:scale-105"
            >
              Explore Collections
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </section>

      {uploadedImage && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                AI Style Analysis
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full rounded-xl border border-cyan-500/30"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  {isAnalyzing ? (
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-cyan-400 text-lg">Analyzing your style...</p>
                    </div>
                  ) : styleScore !== null ? (
                    <div>
                      <div className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-xl p-6 mb-6 border border-cyan-500/30">
                        <p className="text-gray-400 mb-2">Your Style Score</p>
                        <p className="text-5xl font-bold text-white">{styleScore}</p>
                        <p className="text-cyan-400 mt-2">Exceptional Style!</p>
                      </div>
                      <p className="text-gray-300 mb-4">
                        Based on your photo, we've found the perfect pieces for you:
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {recommendations.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Recommended For You</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.map((product) => (
                      <div
                        key={product.id}
                        className="bg-gray-900/50 rounded-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all group"
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="p-4">
                          <h4 className="text-white font-semibold mb-2">{product.name}</h4>
                          <p className="text-cyan-400 font-bold">${product.price}</p>
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full mt-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Why Choose StyleSync?
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Experience the future of fashion shopping
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20 group"
              >
                <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
