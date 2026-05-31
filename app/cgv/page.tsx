import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente de l'offre KMM VIP par KMMTRADEHUB.",
};

export default function CGVPage() {
  return (
    <LegalPage
      title="Conditions générales de vente"
      subtitle="CGV applicables à l'achat de l'offre KMM VIP."
    >
      <h2>Article 1 Objet</h2>
      <p>
        Les présentes conditions générales de vente régissent les ventes
        de l&apos;offre KMM VIP proposée par KMMTRADEHUB. Toute commande
        implique l&apos;acceptation pleine et entière des présentes CGV.
      </p>

      <h2>Article 2 Offre et prix</h2>
      <p>
        L&apos;offre KMM VIP est proposée au prix de <strong className="text-cream/80">50€ TTC par mois</strong>{" "}
        sans engagement de durée. L&apos;abonnement est résiliable à tout moment.
      </p>
      <p>
        KMMTRADEHUB se réserve le droit de modifier ses tarifs à tout moment,
        avec un préavis de 30 jours communiqué aux abonnés actifs.
      </p>

      <h2>Article 3 Commande et paiement</h2>
      <p>
        Le paiement est effectué en ligne via Stripe, plateforme de paiement
        sécurisée. Nous acceptons les cartes bancaires principales.
        Aucune donnée bancaire n&apos;est stockée sur nos serveurs.
      </p>
      <p>
        La commande est confirmée à réception du paiement. Un email de
        confirmation avec les accès est envoyé dans les minutes suivant
        le paiement.
      </p>

      <h2>Article 4 Nature du service</h2>
      <p>
        KMM VIP est une offre de contenus éducatifs sur le trading. Il ne
        s&apos;agit pas d&apos;un service de conseil en investissement. KMMTRADEHUB
        n&apos;est pas un prestataire de services d&apos;investissement agréé par l&apos;AMF.
      </p>
      <p>
        Aucune performance financière n&apos;est garantie. Le trading comporte
        des risques de perte en capital.
      </p>

      <h2>Article 5 Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L221-28 du Code de la consommation, le droit
        de rétractation ne s&apos;applique pas aux contenus numériques dont
        l&apos;exécution a commencé avec l&apos;accord préalable du consommateur et
        renoncement exprès à son droit de rétractation.
      </p>
      <p>
        En procédant au paiement et en accédant immédiatement aux contenus,
        tu renonces expressément à ton droit de rétractation de 14 jours.
      </p>

      <h2>Article 6 Responsabilité</h2>
      <p>
        KMMTRADEHUB ne saurait être tenu responsable des pertes financières
        résultant de décisions de trading prises sur la base des contenus
        proposés. Les informations sont fournies à titre éducatif uniquement.
      </p>

      <h2>Article 7 Propriété intellectuelle</h2>
      <p>
        Tous les contenus accessibles via KMM VIP sont la propriété exclusive
        de KMMTRADEHUB. Toute reproduction, distribution ou revente est
        strictement interdite.
      </p>

      <h2>Article 8 Droit applicable et litiges</h2>
      <p>
        Les présentes CGV sont soumises au droit français. Tout litige sera
        soumis à la compétence exclusive des tribunaux français.
      </p>
      <p>
        Pour toute réclamation, contacte-nous à : contact@kmmtradehub.com
      </p>

      <p className="text-xs text-muted/50 mt-8">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>
    </LegalPage>
  );
}
