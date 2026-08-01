import ProgressBar from "./components/ProgressBar";
import WelcomeCard from "./components/WelcomeCard";

export default function OnboardingPage() {
  return (
    <div className="space-y-12">
      <ProgressBar
        current={1}
        total={7}
      />

      <WelcomeCard />
    </div>
  );
}