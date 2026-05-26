import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreError } from "@/hooks/errors/useFirestoreError";
import { getUserOrders } from "@/services/order/orders.service";
import type { Order } from "@/types/order";

export function useUserOrders() {
  const { user } = useAuth();
  const { error, captureError, clearError } = useFirestoreError();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    getUserOrders(user.uid)
      .then((data) => {
        if (cancelled) return;
        setOrders(data);
        clearError();
      })
      .catch((err) => {
        if (!cancelled) captureError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, captureError, clearError]);

  return { orders, loading, error };
}
