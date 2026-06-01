import VideoToPromptClient from './VideoToPromptClient';

export const metadata = {
  title: 'Video to Prompt Generator - AI Video Analysis for Prompts',
  description: 'Upload any video and get detailed AI prompts for image generators, video generators, and more. Extract frames, analyze scenes, lighting, colors, and camera angles.'
};

export default function Page() {
  return <VideoToPromptClient />;
}
