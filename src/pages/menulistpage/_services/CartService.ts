// src/pages/MenuListPage/_services/CartService.ts
import { instance } from "@services/instance";

type CartType = "menu" | "set_menu" | "seat_fee";

const CART_ID_KEY = "cartId";

function getCartId(): number | null {
  const v = sessionStorage.getItem(CART_ID_KEY);

  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function setCartId(id: number | null) {
  if (id == null) sessionStorage.removeItem(CART_ID_KEY);
  else sessionStorage.setItem(CART_ID_KEY, String(id));
}

export const CartService = {
  add: async ({
    table_num,
    type,
    id,
    quantity,
  }: {
    table_num: number;
    type: CartType;
    id?: number;
    quantity: number;
  }) => {
    const boothId = sessionStorage.getItem("boothId");
    const cartId = getCartId();

    const body: any = {
      table_num,
      type,
      quantity,
    };
    if (id !== undefined) body.id = id;
    if (cartId != null) body.cart_id = cartId;

    const res = await instance.post("/api/v2/cart/", body, {
      headers: { "Booth-ID": boothId },
    });

    const returnedCartId: number | undefined = res?.data?.data?.cart_id;
    if (typeof returnedCartId === "number") {
      setCartId(returnedCartId);
    }

    return res.data;
  },

  exists: async (cartId: number): Promise<boolean> => {
    const boothId = sessionStorage.getItem("boothId");
    const res = await instance.get(`/api/v2/cart/exists/?cartId=${cartId}`, {
      headers: { "Booth-ID": boothId },
    });
    // console.log(res);
    return res.data?.data?.has_cart_items ?? false;
  },

  getLocalCartId: () => getCartId(),
  clearLocalCartId: () => setCartId(null),
};
