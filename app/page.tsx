import { HeroSection } from '@/components/sections/hero';
import { HomeSections } from '@/components/sections/home-sections';
import { getHomePageData } from '@/lib/data';

export default async function HomePage() {
  const data = await getHomePageData();
  return <><HeroSection /><HomeSections data={data} /></>;
}
