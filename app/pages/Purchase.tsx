import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';
import { useParams } from 'next/navigation';
import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers';
import { abi } from '../abi-files/PurchaseABI';
import { savePurchaseHistory } from '../firebase';

interface SaleData {
  launches?: {
    [key: string]: {
      paymentCurrency?: string;
      hasWhitelist?: boolean;
      whitelist?: {
        whitelistMinBuy?: string | number;
        whitelistMaxBuy?: string | number;
        whitelistSalePrice?: string | number;
      };
      minBuy?: string | number;
      maxBuy?: string | number;
      salePrice?: string | number;
      tokenName?: string;
      tokenSymbol?: string;
      tokenAddress?: string;
      softcap?: string | number;
      hardcap?: string | number;
    };
  };
}

interface PurchaseData {
  buyerAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  quantityPurchased: string;
  amountPaid: string;
  paymentToken: string;
  saleId: string;
  whitelistEnabled: boolean;
  softcap: number;
  hardcap: number;
  timestamp: number;
  transactionHash: string;
}

export default function Purchase() {
  const { id } = useParams() as { id: string };
  const [quantity, setQuantity] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [minBuy, setMinBuy] = useState<number>(0);
  const [maxBuy, setMaxBuy] = useState<number>(Infinity);
  const [loading, setLoading] = useState<boolean>(true);
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [paymentToken, setPaymentToken] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [txStatus, setTxStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [contractAddress] = useState<string>('0x322Aaefc8257985F6DfA90235E3d778576Cf95BF');

  useEffect(() => {
    async function fetchLimits() {
      setLoading(true);
      try {
        // Search all users for the sale id
        const allSalesRef = ref(database, 'sales');
        const allSalesSnap = await get(allSalesRef);
        if (allSalesSnap.exists()) {
          const salesData: Record<string, SaleData> = allSalesSnap.val();
          for (const user in salesData) {
            if (salesData[user].launches && salesData[user].launches![id]) {
              const saleData = salesData[user].launches![id];
              let min = 0;
              let max = Infinity;
              let price = null;
              let token = saleData.paymentCurrency || '';
              if (saleData.hasWhitelist && saleData.whitelist) {
                min = Number(saleData.whitelist.whitelistMinBuy) || 0;
                max = Number(saleData.whitelist.whitelistMaxBuy) || Infinity;
                price = Number(saleData.whitelist.whitelistSalePrice) || null;
              } else {
                min = Number(saleData.minBuy) || 0;
                max = Number(saleData.maxBuy) || Infinity;
                price = Number(saleData.salePrice) || null;
              }
              setMinBuy(min);
              setMaxBuy(max);
              setSalePrice(price);
              setPaymentToken(token);
              setOwner(user);
              break;
            }
          }
        }
      } catch (err) {
        setMinBuy(0);
        setMaxBuy(Infinity);
        setSalePrice(null);
        setPaymentToken('');
        setOwner('');
      } finally {
        setLoading(false);
      }
    }
    fetchLimits();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantity(value);
    if (value === '') {
      setError('');
      return;
    }
    const num = Number(value);
    if (num < minBuy) {
      setError(`Minimum buy is ${minBuy}`);
    } else if (num > maxBuy) {
      setError(`Maximum buy is ${maxBuy}`);
    } else {
      setError('');
    }
  };

  const handleBuy = async () => {
    if (error || quantity === '' || loading || !owner || !salePrice) return;
    
    try {
      setTxStatus('processing');
      // Initialize provider and signer
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const buyerAddress = await signer.getAddress();
      
      // Calculate payment amount
      const paymentAmount = parseUnits((Number(quantity) * Number(salePrice)).toString(), 18);
      
      // First get the sale details from Firebase to include in history
      const saleRef = ref(database, `sales/${owner}/launches/${id}`);
      const saleSnap = await get(saleRef);
      const saleData = saleSnap.val() as SaleData['launches'][string];
      
      // Send payment directly to owner's wallet address
      const tx = await signer.sendTransaction({
        to: owner,
        value: paymentAmount
      });
      await tx.wait();
      
      // Prepare purchase data for history
      const purchaseData: PurchaseData = {
        buyerAddress,
        tokenName: saleData.tokenName || '',
        tokenSymbol: saleData.tokenSymbol || '',
        tokenAddress: saleData.tokenAddress || '',
        quantityPurchased: quantity,
        amountPaid: (Number(quantity) * Number(salePrice)).toString(),
        paymentToken: saleData.paymentCurrency || '',
        saleId: id,
        whitelistEnabled: saleData.hasWhitelist || false,
        softcap: Number(saleData.softcap) || 0,
        hardcap: Number(saleData.hardcap) || 0,
        timestamp: Date.now(),
        transactionHash: tx.hash
      };
      
      // Save purchase history to Firebase
      await savePurchaseHistory(owner, purchaseData);
      
      setTxStatus('success');
    } catch (err) {
      console.error('Transaction error:', err);
      setTxStatus('error');
    }
  };

  // Calculate amount to pay
  let amountToPay = '';
  if (salePrice && quantity && !isNaN(Number(quantity))) {
    amountToPay = (Number(quantity) * Number(salePrice)).toString();
  }

  return (
    <div className='mt-20'>
      <label className="block mb-2 font-medium text-gray-700">Token quantity</label>
      <input
        type="number"
        min={minBuy}
        max={maxBuy}
        value={quantity}
        onChange={handleChange}
        className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-400"
        placeholder={loading ? 'Loading limits...' : `Enter token quantity (${minBuy} - ${maxBuy})`}
        disabled={loading}
      />\
      {amountToPay && !error && (
        <div className="mt-2 text-blue-700 text-sm font-semibold">
          Amount to pay: {amountToPay} {paymentToken}
        </div>
      )}
      {owner && (
        <div className="mt-2 text-xs text-gray-500">
          Owner: <span className="font-mono">{owner}</span>
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      
      {txStatus === 'processing' && (
        <div className="mt-4 p-2 bg-blue-100 text-blue-800 rounded">
          Transaction processing...
        </div>
      )}
      {txStatus === 'success' && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
          Payment successful!<br />
          The token will be sent to your wallet after 36 hours of purchase.
        </div>
      )}
      {txStatus === 'error' && (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
          Payment failed. Please try again.
        </div>
      )}
      
      <button
        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold w-full disabled:bg-gray-400"
        type="button"
        disabled={!!error || quantity === '' || loading || txStatus === 'processing'}
        onClick={handleBuy}
      >
        {txStatus === 'processing' ? 'Processing...' : 'Buy'}
      </button>
    </div>
  );
}