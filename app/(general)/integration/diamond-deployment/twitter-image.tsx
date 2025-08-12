import { OgImageIntegration } from '@/components/ui/social/og-image-integrations';

export const runtime = 'edge';

export default function TwitterImage() {
  return OgImageIntegration({
    title: 'Diamond Deployment',
    description: 'Deploy and manage EIP-2535 Diamond contracts',
  });
}