import React, { useEffect } from 'react';
import { TRUST_BRAND, TRUST_LOGO_PATH } from '@/src/config/trustBrand';
import { trackPageView } from '@/src/lib/analytics';
import { useLanguage } from '@/src/context/LanguageContext';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  faqItems?: FAQItem[];
  noIndex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  faqItems,
  noIndex = false,
}) => {
  const { language } = useLanguage();

  useEffect(() => {
    // 1. Format branded page title (under 60 characters for optimal search results)
    const siteTitle = TRUST_BRAND.name;
    const fullTitle = title.includes(siteTitle) || title.includes("Siddhivinayak")
      ? title
      : `${title} | ${siteTitle}`;
    document.title = fullTitle;

    // 2. Resolve Canonical URL & Absolute Image
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentPath = canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const canonicalUrl = `${origin}${currentPath}`;
    const absoluteImage = ogImage
      ? ogImage.startsWith('http')
        ? ogImage
        : `${origin}${ogImage}`
      : `${origin}${TRUST_LOGO_PATH}`;

    // 3. Helper to update or create <meta> tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard description
    setMetaTag('name', 'description', description);

    // Robots directive
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // OpenGraph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', absoluteImage);
    setMetaTag('property', 'og:site_name', TRUST_BRAND.name);

    // Locale metadata based on active language
    const ogLocale = language === 'mr' ? 'mr_IN' : language === 'hi' ? 'hi_IN' : 'en_IN';
    setMetaTag('property', 'og:locale', ogLocale);

    // Twitter / X Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', absoluteImage);

    // Canonical link tag
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Structured Data (JSON-LD)
    const jsonLdId = 'sct-structured-data';
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = jsonLdId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData: any = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'NGO',
          '@id': `${origin}/#organization`,
          name: TRUST_BRAND.name,
          alternateName: TRUST_BRAND.marathiName,
          url: origin,
          logo: absoluteImage,
          email: TRUST_BRAND.contact.email,
          telephone: '+91-9922271777',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Nashik',
            addressRegion: 'Maharashtra',
            addressCountry: 'IN',
          },
          taxID: TRUST_BRAND.registrationNumber,
          description:
            'Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik is a registered charitable trust (Reg. No. E/1341) dedicated to education, medical care, senior welfare, and community relief.',
        },
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: fullTitle,
          description: description,
          isPartOf: { '@id': `${origin}/#organization` },
          inLanguage: language === 'mr' ? 'mr' : language === 'hi' ? 'hi' : 'en',
        },
      ],
    };

    // Add FAQPage Schema if FAQ items are provided
    if (faqItems && faqItems.length > 0) {
      structuredData['@graph'].push({
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }

    scriptTag.textContent = JSON.stringify(structuredData);

    // Track privacy-conscious page view in GA4
    trackPageView(currentPath, fullTitle);
  }, [title, description, canonicalPath, ogImage, ogType, faqItems, noIndex, language]);

  return null;
};
