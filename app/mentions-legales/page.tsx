import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de KMMTRADEHUB.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      subtitle="Informations légales relatives au site KMMTRADEHUB."
    >
      <h2>Éditeur du site</h2>
      <p>
        <strong className="text-cream/80">Nom commercial :</strong> KMMTRADEHUB
        <br />
        <strong className="text-cream/80">Email :</strong> contact@kmmtradehub.com
        <br />
        <strong className="text-cream/80">Site web :</strong> kmmtradehub.com
      </p>
      <p>
        Directeur de la publication : [Nom du responsable — à compléter]
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par :<br />
        <strong className="text-cream/80">Vercel Inc.</strong><br />
        340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis<br />
        <a href="https://vercel.com">vercel.com</a>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur ce site (textes, images, logos,
        vidéos, etc.) sont la propriété de KMMTRADEHUB ou de leurs auteurs
        respectifs et sont protégés par les lois françaises et internationales
        relatives à la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, distribution ou utilisation sans autorisation
        écrite préalable est strictement interdite.
      </p>

      <h2>Avertissement sur les risques financiers</h2>
      <p>
        Le trading sur les marchés financiers comporte un risque significatif
        de perte en capital. Les contenus proposés par KMMTRADEHUB sont de
        nature éducative uniquement et ne constituent pas des conseils en
        investissement au sens de la réglementation en vigueur.
      </p>
      <p>
        KMMTRADEHUB n&apos;est pas un prestataire de services d&apos;investissement agréé.
        Les performances passées ne préjugent pas des performances futures.
      </p>

      <h2>Limitation de responsabilité</h2>
      <p>
        KMMTRADEHUB ne saurait être tenu responsable des décisions
        d&apos;investissement prises par les utilisateurs sur la base des
        informations ou contenus disponibles sur ce site.
      </p>

      <h2>Droit applicable</h2>
      <p>
        Le présent site est soumis au droit français. Tout litige relatif
        à l&apos;utilisation du site sera soumis à la compétence exclusive
        des juridictions françaises.
      </p>

      <p className="text-xs text-muted/50 mt-8">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>
    </LegalPage>
  );
}
