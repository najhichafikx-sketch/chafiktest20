import VideoToPromptClient from './VideoToPromptClient';

export const metadata = {
  title: 'Video to Prompt Generator - AI Video Analysis for Prompts | ChafikTech',
  description: 'Convert any video into detailed AI prompts. Analyze style, camera movement, lighting, scenes, and recreate videos using Veo, Kling, Runway, and other AI video generators.',
  openGraph: {
    title: 'Video to Prompt Generator - AI Video Analysis for Prompts | ChafikTech',
    description: 'Convert any video into detailed AI prompts for Veo, Kling, Runway, Pika, Hailuo, Luma, and other AI video generators. Upload MP4, MOV, AVI, or WEBM.',
    images: [{ url: '/og-video-to-prompt.png', width: 1200, height: 630 }]
  },
  twitter: {
    title: 'Video to Prompt Generator - AI Video Analysis for Prompts | ChafikTech',
    description: 'Convert any video into detailed AI prompts for Veo, Kling, Runway, Pika, Hailuo, Luma, and other AI video generators.',
    card: 'summary_large_image'
  }
};

export default function Page() {
  return <VideoToPromptClient />;
};
