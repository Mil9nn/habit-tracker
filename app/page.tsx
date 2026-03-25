import MainLayout from './layout/MainLayout'
import CalorieTracker from "./calorie/page"

export default function Home() {
  return (
    <MainLayout>
      <CalorieTracker />
    </MainLayout>
  )
}