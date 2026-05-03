import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleCallback, getIdTokenClaims } from "@/lib/auth";
import { mergeIdentity } from "@/lib/tracking";
import SEO from "@/components/SEO";

export default function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const ok = await handleCallback();
      if (ok) {
        const claims = getIdTokenClaims();
        if (claims?.sub) {
          mergeIdentity(claims.sub as string);
        }
      }
      navigate(ok ? "/account" : "/login");
    })();
  }, [navigate]);
  return <SEO title="Authenticating — Anurpan Jewellery" noindex />;
}
