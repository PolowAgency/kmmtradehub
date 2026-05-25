import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement des données personnelles de KMMTRADEHUB.",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      subtitle="Comment nous collectons et utilisons vos données personnelles."
    >
      <h2>Responsable du traitement</h2>
      <p>
        KMMTRADEHUB est responsable du traitement de tes données personnelles
        collectées via ce site. Contact : contact@kmmtradehub.com
      </p>

      <h2>Données collectées</h2>
      <p>Nous collectons les données suivantes :</p>
      <ul>
        <li>Nom et prénom (formulaire de contact et paiement)</li>
        <li>Adresse email (formulaire de contact, paiement, newsletter)</li>
        <li>Données de paiement (traitées par Stripe — nous n&apos;y avons pas accès)</li>
        <li>Données de navigation (cookies techniques)</li>
      </ul>

      <h2>Finalités du traitement</h2>
      <p>Tes données sont utilisées pour :</p>
      <ul>
        <li>Traiter ton paiement et accès à KMM VIP</li>
        <li>Répondre à tes demandes de contact</li>
        <li>T&apos;envoyer des emails de confirmation</li>
        <li>Améliorer notre service</li>
      </ul>

      <h2>Base légale</h2>
      <p>
        Le traitement de tes données repose sur l&apos;exécution d&apos;un contrat
        (paiement et accès à l&apos;offre) et ton consentement (formulaire de contact,
        newsletter).
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Tes données sont conservées pendant la durée nécessaire à la fourniture
        du service, puis archivées conformément aux obligations légales (5 ans
        pour les données comptables).
      </p>

      <h2>Partage des données</h2>
      <p>
        Tes données ne sont jamais vendues à des tiers. Elles peuvent être
        partagées avec nos prestataires techniques :
      </p>
      <ul>
        <li><strong className="text-cream/80">Stripe</strong> — traitement des paiements</li>
        <li><strong className="text-cream/80">Resend</strong> — envoi d&apos;emails transactionnels</li>
        <li><strong className="text-cream/80">Vercel</strong> — hébergement du site</li>
      </ul>

      <h2>Tes droits</h2>
      <p>
        Conformément au RGPD, tu disposes des droits suivants : accès,
        rectification, suppression, portabilité, opposition et limitation
        du traitement.
      </p>
      <p>
        Pour exercer ces droits, contacte-nous à : contact@kmmtradehub.com
      </p>

      <h2>Cookies</h2>
      <p>
        Ce site utilise uniquement des cookies techniques nécessaires au
        fonctionnement du site. Aucun cookie publicitaire ou de tracking
        tiers n&apos;est utilisé.
      </p>

      <h2>Contact CNIL</h2>
      <p>
        En cas de litige, tu peux saisir la Commission Nationale de
        l&apos;Informatique et des Libertés (CNIL) :{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          cnil.fr
        </a>
      </p>

      <p className="text-xs text-muted/50 mt-8">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>
    </LegalPage>
  );
}
