import { SiteHeader } from '@/components/site-header';

export default function InformationLoading() {
  return (
    <>
      <SiteHeader />
      <main className="information-shell" aria-busy="true" aria-label="Загрузка информации">
        <div className="information-skeleton information-skeleton--title" />
        <div className="information-skeleton information-skeleton--lead" />
        <div className="information-skeleton-grid">
          <div className="information-skeleton" />
          <div className="information-skeleton" />
          <div className="information-skeleton" />
        </div>
      </main>
    </>
  );
}
