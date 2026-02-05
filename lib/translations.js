export const SUPPORTED_LANGS = ['ar','en','fr','de','ru','ja']

export const translations = {
  ar: {
    paymentMethod: 'طرق الدفع',
    cash: 'قبول الدفع عند الاستلام (كاش)',
    instapay: 'قبول الدفع عبر InstaPay',
    visa: 'قبول الدفع عبر Visa (عند الاستلام)'
  },
  en: {
    paymentMethod: 'Payment Methods',
    cash: 'Accept Cash on Delivery',
    instapay: 'Accept InstaPay',
    visa: 'Accept Visa / Mastercard (on Delivery)'
  },
  fr: {
    paymentMethod: 'Méthodes de paiement',
    cash: 'Paiement en espèces à la livraison',
    instapay: 'Accepter InstaPay',
    visa: 'Accepter Visa / Mastercard (à la livraison)'
  },
  de: {
    paymentMethod: 'Zahlungsmethoden',
    cash: 'Barzahlung bei Lieferung',
    instapay: 'InstaPay akzeptieren',
    visa: 'Visa / Mastercard akzeptieren (bei Lieferung)'
  },
  ru: {
    paymentMethod: 'Способы оплаты',
    cash: 'Оплата наличными при доставке',
    instapay: 'Принимать InstaPay',
    visa: 'Принимать Visa / Mastercard (при доставке)'
  },
  ja: {
    paymentMethod: '支払い方法',
    cash: '代金引換（現金）を受け付ける',
    instapay: 'InstaPayを受け付ける',
    visa: 'Visa / Mastercard（配達時）を受け付ける'
  }
}

export function detectLanguage() {
  if (typeof window === 'undefined') return 'ar'
  try {
    const saved = localStorage.getItem('siteLanguage')
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved
  } catch (e) {}

  const nav = (navigator && navigator.language) ? navigator.language : 'ar'
  const short = nav.split('-')[0]
  return SUPPORTED_LANGS.includes(short) ? short : 'ar'
}

export default translations
