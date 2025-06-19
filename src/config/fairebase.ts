import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import serviceAccount from "../../pc-api-5991691676741749225-378-firebase-adminsdk-fbsvc-cbd67f54db.json";

const app = initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  storageBucket: "gs://pc-api-5991691676741749225-378.firebasestorage.app"
});

const db = getFirestore(app);

const bucket = getStorage().bucket();

export { db, bucket };

