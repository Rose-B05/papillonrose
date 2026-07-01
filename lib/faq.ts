export interface FaqItem {
  question: string
  answer: string
}

export interface FaqSection {
  theme: string
  items: FaqItem[]
}

export const FAQ_DATA: FaqSection[] = [
  {
    theme: "Réservation et devis",
    items: [
      {
        question: "Comment fonctionne le processus de location ?",
        answer:
          "Parcourez notre catalogue, ajoutez les articles souhaités à votre panier, choisissez vos dates de location et soumettez votre demande de devis. Nous vous recontacterons sous 24h avec un devis personnalisé incluant les disponibilités confirmées.",
      },
      {
        question: "Quel est le délai de réponse pour un devis ?",
        answer:
          "Nous nous engageons à vous envoyer un devis personnalisé sous 24 heures ouvrées (lundi à vendredi) après réception de votre demande complète.",
      },
      {
        question: "Puis-je modifier ou annuler ma réservation ?",
        answer:
          "Oui, vous pouvez modifier votre réservation tant que le devis n'a pas été validé. Après validation, les annulations sont soumises aux conditions suivantes : plus de 30 jours avant l'événement → remboursement total ; entre 15 et 30 jours → remboursement de 50% ; moins de 15 jours → aucun remboursement.",
      },
      {
        question: "Y a-t-il un minimum de commande ?",
        answer:
          "Il n'y a pas de minimum de commande. Vous pouvez louer un seul article ou plusieurs dizaines. Notre service est adapté aussi bien aux petits événements intimes que aux grandes réceptions.",
      },
    ],
  },
  {
    theme: "Retrait et livraison",
    items: [
      {
        question: "Où se fait le retrait du matériel ?",
        answer:
          "Le retrait se fait à Créteil (94), en Île-de-France. L'adresse exacte vous sera communiquée lors de la confirmation de votre réservation. Le retrait s'effectue sur rendez-vous aux horaires convenus.",
      },
      {
        question: "Livrez-vous à domicile ?",
        answer:
          "Oui, la livraison est disponible en Île-de-France (départements 94, 93, 95, 77 et 91). Les frais de livraison et de montage sont à votre charge et précisés dans votre devis.",
      },
      {
        question: "Quels sont les frais de livraison ?",
        answer:
          "Les frais de livraison varient en fonction de la distance, du volume du matériel et de l'option de montage souhaitée. Ils sont détaillés dans votre devis personnalisé.",
      },
    ],
  },
  {
    theme: "Restitution et caution",
    items: [
      {
        question: "Quel est le délai de restitution ?",
        answer:
          "Le matériel doit être restitué avant 12h à la date convenue, conformément au calendrier indiqué dans votre devis. Des règles spécifiques s'appliquent selon le jour de début de votre location.",
      },
      {
        question: "Que se passe-t-il en cas de retard de restitution ?",
        answer:
          "Une pénalité de retard est appliquée : 10% du montant total le premier jour, puis 30% par jour supplémentaire, plafonnée à 50% du montant total. La formule est : min(10% + (jours - 1) × 30%, 50%).",
      },
      {
        question: "Y a-t-il une caution ? Comment est-elle calculée ?",
        answer:
          "Une caution peut être exigée avant la prise en charge du matériel. Elle est restituée intégralement dans un délai de 14 jours ouvrés après la restitution, déduction faite des éventuelles pénalités.",
      },
      {
        question: "Que se passe-t-il si un article est endommagé ou perdu ?",
        answer:
          "En cas de casse partielle, des frais de réparation + 20% de la valeur de location sont appliqués. En cas de casse totale ou de perte, un remplacement à valeur à neuf est requis. Un état des lieux contradictoire est réalisé à la restitution.",
      },
    ],
  },
  {
    theme: "Paiement",
    items: [
      {
        question: "Quels modes de paiement acceptez-vous ?",
        answer:
          "Nous acceptons les paiements par carte bancaire (via Stripe, sécurisé), virement bancaire et PayPal. L'acompte de 30% est réglé à la confirmation de la réservation.",
      },
      {
        question: "Quand le paiement est-il effectué ?",
        answer:
          "Un acompte de 30% est requis pour confirmer votre réservation. Le solde (70%) est à régler au plus tard 7 jours avant la date de votre événement.",
      },
    ],
  },
]
