import type { Profile } from '../../types';
import StudyGuideApp from '../StudyGuideApp';
import { LogoutButton } from '../shared/LogoutButton';

export default function StudentDashboard({ profile }: { profile: Profile }): JSX.Element {
  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <header className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h1 className="text-2xl">Welcome Student, {profile.name}</h1>
        <LogoutButton />
      </header>
      <main>
        <StudyGuideApp profile={profile} />
      </main>
    </div>
  );
}
