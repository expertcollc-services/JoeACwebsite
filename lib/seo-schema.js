function buildLocalBusinessSchema(settings) {
  return {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    name: settings.businessName || "Elite Quality HVAC",
    description: "Commercial HVAC and refrigeration services for Chicago businesses",
    telephone: settings.phone || "+1-312-555-0119",
    email: settings.email || "service@elitequalityhvac.com",
    url: "https://elitequalityhvac.com",
    logo: settings.logoUrl || "https://elitequalityhvac.com/logo.png",
    image: "https://elitequalityhvac.com/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "747 S Dixie Ave",
      addressLocality: "Chicago",
      addressRegion: "IL",
      postalCode: "60601",
      addressCountry: "US"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.8781,
      longitude: -87.6298
    },
    areaServed: [
      { "@type": "City", name: "Chicago" },
      { "@type": "City", name: "Naperville" },
      { "@type": "City", name: "Schaumburg" }
    ],
    priceRange: "$$",
    openingHours: "Mo-Su 00:00-23:59",
    sameAs: [
      settings.social?.facebook || "",
      settings.social?.instagram || "",
      settings.social?.linkedin || ""
    ].filter(Boolean),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "400",
      bestRating: "5",
      worstRating: "1"
    }
  };
}

function buildOrganizationSchema(settings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.businessName || "Elite Quality HVAC",
    url: "https://elitequalityhvac.com",
    logo: {
      "@type": "ImageObject",
      url: settings.logoUrl || "https://elitequalityhvac.com/logo.png",
      width: 180,
      height: 60
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.phone || "+1-312-555-0119",
      contactType: "customer service",
      email: settings.email || "service@elitequalityhvac.com",
      areaServed: "US",
      availableLanguage: "English"
    },
    sameAs: [
      settings.social?.facebook || "",
      settings.social?.instagram || "",
      settings.social?.linkedin || ""
    ].filter(Boolean)
  };
}

function buildServiceSchema(service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    provider: {
      "@type": "HVACBusiness",
      name: "Elite Quality HVAC"
    },
    areaServed: {
      "@type": "City",
      name: "Chicago"
    },
    description: service.description || "",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        price: "Contact for quote"
      }
    }
  };
}

function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://elitequalityhvac.com${item.path}`
    }))
  };
}

function buildReviewSchema(review) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "HVACBusiness",
      name: "Elite Quality HVAC"
    },
    author: {
      "@type": "Person",
      name: review.reviewerName
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: "5",
      worstRating: "1"
    },
    reviewBody: review.quote
  };
}

function buildFAQSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

module.exports = {
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildServiceSchema,
  buildBreadcrumbSchema,
  buildReviewSchema,
  buildFAQSchema
};
