// src/context/UserPlanContext.tsx
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig";

type PlanType = "free" | "basic" | "student" | "premium";
type PlanStatus = "none" | "inactive" | "active";

type UserPlanContextType = {
  loading: boolean;
  uid: string | null;
  email: string | null;
  plan: PlanType;
  planStatus: PlanStatus;
  isPremiumActive: boolean;
  isStudentActive: boolean;
  hasAnyPaidPlan: boolean;
};

const UserPlanContext = createContext<UserPlanContextType>({
  loading: true,
  uid: null,
  email: null,
  plan: "free",
  planStatus: "none",
  isPremiumActive: false,
  isStudentActive: false,
  hasAnyPaidPlan: false,
});

export const UserPlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<UserPlanContextType>({
    loading: true,
    uid: null,
    email: null,
    plan: "free",
    planStatus: "none",
    isPremiumActive: false,
    isStudentActive: false,
    hasAnyPaidPlan: false,
  });

  useEffect(() => {
    // 1) Escuchar login/logout
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setState({
          loading: false,
          uid: null,
          email: null,
          plan: "free",
          planStatus: "none",
          isPremiumActive: false,
          isStudentActive: false,
          hasAnyPaidPlan: false,
        });
        return;
      }

      const uid = user.uid;
      const email = user.email ?? null;
      const userRef = doc(db, "Usuarios", uid);

      // 2) Escuchar documento Usuarios/{uid}
      const unsubDoc = onSnapshot(
        userRef,
        (snap) => {
          const data = snap.data() as any | undefined;

          const plan = (data?.plan as PlanType) ?? "free";
          const planStatus = (data?.planStatus as PlanStatus) ?? "none";

          const isPremiumActive = plan === "premium" && planStatus === "active";
          const isStudentActive = plan === "student" && planStatus === "active";
          const hasAnyPaidPlan =
            planStatus === "active" && (plan === "premium" || plan === "student" || plan === "basic");

          setState({
            loading: false,
            uid,
            email,
            plan,
            planStatus,
            isPremiumActive,
            isStudentActive,
            hasAnyPaidPlan,
          });
        },
        (error) => {
          console.log("Error leyendo Usuarios/{uid} en UserPlanProvider:", error);
          setState((prev) => ({
            ...prev,
            loading: false,
          }));
        }
      );

      return () => {
        unsubDoc();
      };
    });

    return () => {
      unsubAuth();
    };
  }, []);

  return (
    <UserPlanContext.Provider value={state}>
      {children}
    </UserPlanContext.Provider>
  );
};

export const useUserPlan = () => useContext(UserPlanContext);
