const RETAILERS = [
  {
    name: "American Golf",
    buildUrl: (q: string) => {
      const base = `https://www.americangolf.co.uk/search?q=${encodeURIComponent(q)}`;
      const tag = process.env.NEXT_PUBLIC_AFFILIATE_AMERICAN_GOLF;
      return tag ? `${base}&affil=${tag}` : base;
    },
  },
  {
    name: "GolfBidder",
    buildUrl: (q: string) => {
      const base = `https://www.golfbidder.co.uk/?q=${encodeURIComponent(q)}`;
      const tag = process.env.NEXT_PUBLIC_AFFILIATE_GOLFBIDDER;
      return tag ? `${base}&awc=${tag}` : base;
    },
  },
];

export function getAffiliateLinks(brand: string, model: string) {
  const query = `${brand} ${model}`.trim();
  return RETAILERS.map(({ name, buildUrl }) => ({ name, url: buildUrl(query) }));
}
