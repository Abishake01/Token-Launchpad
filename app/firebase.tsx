import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, Database, ThenableReference } from "firebase/database";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

interface TokenData {
  tokenAddress: string;
  [key: string]: any; // Additional token properties
}

interface LaunchData {
  [key: string]: any; // Structure of your launch data
}

interface PurchaseData {
  [key: string]: any; // Structure of your purchase data
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyD3kh4rXsVW2jtDPT7xJCIV13_cgt4Pfww",
  authDomain: "technova-token.firebaseapp.com",
  databaseURL: "https://technova-token-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "technova-token",
  storageBucket: "technova-token.appspot.com",
  messagingSenderId: "145731358773",
  appId: "1:145731358773:web:f499afb6c0067e9c6fa17c",
  measurementId: "G-JXXC7WGEG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database: Database = getDatabase(app);

export { database };

// Token-related functions
export const saveTokenData = async (walletAddress: string, tokenData: TokenData): Promise<void> => {
  try {
    const userTokensRef = ref(database, `users/${walletAddress}/tokens/${tokenData.tokenAddress}`);
    await set(userTokensRef, tokenData);
    console.log("Token data saved successfully");
  } catch (error) {
    console.error("Error saving token data:", error);
    throw error;
  }
};

export const getTokensByWallet = async (walletAddress: string): Promise<Record<string, TokenData> | null> => {
  try {
    const userTokensRef = ref(database, `users/${walletAddress}/tokens`);
    const snapshot = await get(userTokensRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error fetching token data:", error);
    throw error;
  }
};

export const savePresaleLaunch = async (
  walletAddress: string,
  launchData: LaunchData
): Promise<string> => {
  try {
    // Create a new reference with a unique key under the user's launches
    const launchesRef = ref(database, `sales/${walletAddress}/launches`);
    const newLaunchRef: ThenableReference = push(launchesRef);
    await set(newLaunchRef, launchData);
    console.log("Presale launch saved successfully");
    return newLaunchRef.key as string; // Return the unique ID of the new launch
  } catch (error) {
    console.error("Error saving presale launch:", error);
    throw error;
  }
};

export const savePurchaseHistory = async (
  sellerWallet: string,
  purchaseData: PurchaseData
): Promise<string> => {
  try {
    const historyRef = ref(database, `sales/${sellerWallet}/history`);
    const newPurchaseRef: ThenableReference = push(historyRef);
    await set(newPurchaseRef, purchaseData);
    console.log("Purchase history saved successfully");
    return newPurchaseRef.key as string; // Return the unique ID of the new purchase
  } catch (error) {
    console.error("Error saving purchase history:", error);
    throw error;
  }
};