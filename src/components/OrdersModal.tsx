import React, { useEffect, useState } from 'react';
import { 
  X, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  MessageCircle, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { OrderRecord, UserProfile, Currency } from '../types';
import { formatPrice } from '../data/products';
import { 
  subscribeUserOrders, 
  subscribeAllOrdersForAdmin, 
  updateOrderStatusInFirestore 
} from '../firebase/orders';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currency: Currency;
  onLogin: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currency,
  onLogin
}) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !currentUser) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (currentUser.role === 'admin' && isAdminView) {
      const unsub = subscribeAllOrdersForAdmin(
        (allOrders) => {
          setOrders(allOrders);
          setIsLoading(false);
        },
        (err) => {
          console.error('Error fetching admin orders:', err);
          setIsLoading(false);
        }
      );
      return () => unsub();
    } else {
      const unsub = subscribeUserOrders(
        currentUser.id,
        (userOrders) => {
          setOrders(userOrders);
          setIsLoading(false);
        },
        (err) => {
          console.error('Error fetching user orders:', err);
          setIsLoading(false);
        }
      );
      return () => unsub();
    }
  }, [isOpen, currentUser, isAdminView]);

  if (!isOpen) return null;

  const handleStatusChange = async (orderId: string, newStatus: OrderRecord['status']) => {
    try {
      setStatusUpdatingId(orderId);
      await updateOrderStatusInFirestore(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Paid & Confirmed</span>;
      case 'processing':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">In Framing / Studio</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full flex items-center gap-1"><Truck className="w-3 h-3" /> In Transit</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-full">Pending</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-2 text-xl rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-slate-900">
                {isAdminView ? 'Admin Studio: All Orders' : 'My Orders & Deliveries'}
              </h3>
              <p className="text-xs text-slate-500">
                Live Firestore synchronization with status tracking.
              </p>
            </div>
          </div>

          {/* Admin toggle if user is admin */}
          {currentUser?.role === 'admin' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdminView(!isAdminView)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                  isAdminView
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAdminView ? 'Admin View Active' : 'Switch to Admin View'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Not Logged In State */}
        {!currentUser ? (
          <div className="text-center py-14 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-serif font-bold text-lg text-slate-900">
              Sign In to View Your Orders
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please sign in with your Google account to access your past artwork purchases, invoices, and shipment tracking.
            </p>
            <button
              type="button"
              onClick={onLogin}
              className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-all shadow-md"
            >
              Sign In with Google
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading orders from Firestore...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No orders recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Orders placed via checkout will automatically appear here.</p>
          </div>
        ) : (
          /* Orders list */
          <div className="my-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 text-xs"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {order.orderNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}

                    {/* Admin Status Changer */}
                    {currentUser.role === 'admin' && isAdminView && (
                      <select
                        value={order.status}
                        disabled={statusUpdatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderRecord['status'])}
                        className="bg-white border border-slate-300 text-[10px] font-semibold rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {item.size} • {item.frame} (Qty: {item.quantity})
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatPrice(item.priceNGN * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Customer Details & Paystack Ref */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="block font-semibold text-slate-800">
                      Purchaser: {order.customerName}
                    </span>
                    <span className="text-slate-500 block">{order.customerEmail} • {order.customerPhone}</span>
                    <span className="text-slate-500 flex items-start gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span>{order.shippingAddress}</span>
                    </span>
                  </div>

                  <div className="sm:text-right flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Paid Amount</span>
                      <span className="text-base font-bold text-brand-700">
                        {formatPrice(order.totalAmountNGN, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Ref: {order.paystackReference}
                      </span>
                    </div>

                    <div className="mt-2 sm:self-end">
                      <a
                        href={`https://wa.me/2348154224416?text=${encodeURIComponent(
                          `Hello Printscrafter Concierge, I would like to inquire about my order: ${order.orderNumber}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp Concierge</span>
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-200 pt-4 text-center">
          <p className="text-[11px] text-slate-400">
            For custom inquiries, contact our studio at Lekki Phase 1, Lagos or call +234 815 422 4416.
          </p>
        </div>

      </div>
    </div>
  );
};
