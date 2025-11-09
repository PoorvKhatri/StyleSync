import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Wand2 } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { additionalProducts } from '../lib/products';
import { useCart } from '../contexts/CartContext';

export const TryOnPage = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('category', ['tops', 'dresses', 'outerwear'])
      .limit(12);

    if (data) {
      const filteredAdditional = additionalProducts.filter(p =>
        ['tops', 'dresses', 'outerwear'].includes(p.category)
      );
      setProducts([...data, ...filteredAdditional]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUserImage(event.target?.result as string);
      setTryOnResult(null);
    };
    reader.readAsDataURL(file);
  };

  const processTryOn = () => {
    if (!userImage || !selectedProduct) {
      alert('Please upload your photo and select a product');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Simulate virtual try-on by overlaying product image on user image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const userImg = new Image();
      const productImg = new Image();

      userImg.onload = () => {
        canvas.width = userImg.width;
        canvas.height = userImg.height;
        ctx.drawImage(userImg, 0, 0);

        productImg.onload = () => {
          // Overlay product image on the upper body area
          const overlayWidth = canvas.width * 0.6;
          const overlayHeight = canvas.height * 0.4;
          const overlayX = (canvas.width - overlayWidth) / 2;
          const overlayY = canvas.height * 0.2;

          ctx.globalAlpha = 0.8; // Semi-transparent overlay
          ctx.drawImage(productImg, overlayX, overlayY, overlayWidth, overlayHeight);
          ctx.globalAlpha = 1.0;

          const resultUrl = canvas.toDataURL();
          setTryOnResult(resultUrl);
          setIsProcessing(false);
        };
        productImg.src = selectedProduct.image_url;
      };
      userImg.src = userImage;
    }, 2500);
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-4">
            Virtual Try-On
          </h1>
          <p className="text-gray-400 text-lg">
            See how clothes look on you before buying
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Camera className="w-6 h-6 text-cyan-400" />
              Step 1: Upload Your Photo
            </h2>

            {!userImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cyan-500/30 rounded-xl p-12 text-center cursor-pointer hover:border-cyan-500/60 transition-all group"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-cyan-400 transition-colors" />
                <p className="text-gray-400 mb-2">Click to upload your photo</p>
                <p className="text-gray-500 text-sm">Best results with front-facing photos</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={userImage}
                  alt="Your photo"
                  className="w-full rounded-xl border border-cyan-500/30"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-4 right-4 px-4 py-2 bg-cyan-500/80 backdrop-blur-xl rounded-lg text-white hover:bg-cyan-500 transition-all"
                >
                  Change Photo
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-pink-400" />
              Step 2: Select Product
            </h2>

            {selectedProduct ? (
              <div className="border border-cyan-500/30 rounded-xl overflow-hidden mb-4">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 bg-gray-900/50">
                  <h3 className="text-white font-semibold mb-2">{selectedProduct.name}</h3>
                  <p className="text-cyan-400 font-bold">₹{selectedProduct.price}</p>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="mt-3 w-full py-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 transition-all"
                  >
                    Choose Different Product
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="cursor-pointer rounded-lg overflow-hidden border border-cyan-500/20 hover:border-cyan-500/60 transition-all group"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-24 object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={processTryOn}
              disabled={!userImage || !selectedProduct || isProcessing}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Virtual Try-On...
                </div>
              ) : (
                <>
                  <Wand2 className="inline w-5 h-5 mr-2" />
                  Try On Now
                </>
              )}
            </button>
          </div>
        </div>

        {tryOnResult && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Your Virtual Try-On Result
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-400 mb-3 text-center">Original</p>
                <img
                  src={userImage!}
                  alt="Original"
                  className="w-full rounded-xl border border-cyan-500/30"
                />
              </div>

              <div>
                <p className="text-gray-400 mb-3 text-center">With {selectedProduct?.name}</p>
                <div className="relative">
                  <img
                    src={tryOnResult}
                    alt="Try-on result"
                    className="w-full rounded-xl border border-pink-500/30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent rounded-xl" />
                  <div className="absolute bottom-4 left-4 right-4 bg-gray-900/80 backdrop-blur-xl rounded-lg p-4">
                    <p className="text-white font-semibold mb-2">{selectedProduct?.name}</p>
                    <p className="text-cyan-400 font-bold mb-3">₹{selectedProduct?.price}</p>
                    <button
                      onClick={() => selectedProduct && addToCart(selectedProduct)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setTryOnResult(null);
                  setSelectedProduct(null);
                }}
                className="px-8 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
              >
                Try Another Product
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">How it Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-cyan-400 font-bold">1</span>
              </div>
              <p className="text-gray-400">Upload a clear front-facing photo of yourself</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-pink-400 font-bold">2</span>
              </div>
              <p className="text-gray-400">Select any product from our collection</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-cyan-400 font-bold">3</span>
              </div>
              <p className="text-gray-400">See instant AI-powered virtual try-on results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
