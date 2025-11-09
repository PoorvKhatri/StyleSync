import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar = ({ isOpen, onClose, onCheckout }: CartSidebarProps) => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-900 border-l border-cyan-500/20 z-50 shadow-2xl shadow-cyan-500/20 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Your Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.product?.image_url}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{item.product?.name}</h3>
                        <p className="text-cyan-400 font-bold mt-1">
                          ${item.product?.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="ml-auto p-1 rounded bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t border-cyan-500/20 bg-gray-900/80 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Total</span>
                <span className="text-2xl font-bold text-white">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => {
                  if (user) {
                    onCheckout();
                  } else {
                    alert('Please login to checkout');
                  }
                }}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
