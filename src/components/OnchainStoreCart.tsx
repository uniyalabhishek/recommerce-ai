import { useCallback, useMemo } from 'react';
import { useOnchainStoreContext } from './OnchainStoreProvider';
import useCreateCharge from 'src/hooks/useCreateCharge';
import {
  Checkout,
  CheckoutButton,
  LifecycleStatus,
} from '@coinbase/onchainkit/checkout';
import type { OnchainStoreCartReact } from 'src/types';

export default function OnchainStoreCart({}: OnchainStoreCartReact) {
  const { quantities, products } = useOnchainStoreContext();

  const totalSum = useMemo(() => {
    return (
      products?.reduce(
        (sum, product) => sum + (quantities[product.id] || 0) * product.price,
        0,
      ) || 0
    );
  }, [products, quantities]);

  const { createCharge } = useCreateCharge();

  const handleStatusChange = useCallback((status: LifecycleStatus) => {
    console.log('onStatus', status);
  }, []);

  const chargeHandler = useCallback(() => {
    const description = Object.keys(quantities)
      .map((productId) => {
        return `${productId}(${quantities[productId]})`;
      })
      .join(',');
    const chargeDetails = {
      name: 'commerce template charge',
      description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: totalSum.toString(),
        currency: 'USD',
      },
    };
    return createCharge(chargeDetails);
  }, [createCharge, quantities, totalSum]);

  const key = useMemo(() => {
    if (!quantities) return '';
    const productIds = Object.keys(quantities);
    const values = Object.values(quantities).flat();
    return `${productIds.join('.')}-${values.join('.')}`;
  }, [quantities]);

  return (
    <div className="-mx-[50vw] fixed right-1/2 bottom-0 left-1/2 w-screen border-gray-200 border-t bg-[white]">
      <div className="mx-auto max-w-5xl ">
        <div className="flex flex-col items-start justify-between py-4 md:flex-row md:items-center">
          <span className="mb-2 hidden px-4 text-xs sm:flex md:mb-0 md:w-1/3 lg:px-6">
            Built with OnchainKit
          </span>
          <div className="flex w-full grow flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:gap-0 md:w-auto lg:px-6">
            <h2 className="font-bold text-lg md:w-11/12 ">
              TOTAL {totalSum.toFixed(2)} USDC
            </h2>
            <div className="w-64">
              <Checkout
                key={key}
                onStatus={handleStatusChange}
                chargeHandler={chargeHandler}
              >
                <CheckoutButton
                  coinbaseBranded={true}
                  text="Pay with Crypto"
                  disabled={!totalSum}
                />
              </Checkout>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
