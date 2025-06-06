"use client";
import { useState } from "react";
// Import Bootstrap's RTL CSS globally in your Next.js project's layout.js or a global CSS file.
// For example, in app/layout.js or app/globals.css:
// @import 'bootstrap/dist/css/bootstrap.rtl.min.css';
// Or via CDN in your root layout HTML:
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css" rel="stylesheet">


type Product = {
  name: string;
  price: string;
  shops: string;
  link: string;
  img: string;
  isAd: boolean;
};

type ScrapeResult = {
  products: Product[];
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const handleScrape = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrorDetails("");
    setResult(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "خطا در دریافت اطلاعات");
        setErrorDetails(data.details || "");
        return;
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 bg-body-tertiary" dir="rtl" style={{fontFamily: 'Vazirmatn, IRANSans, Arial', minHeight: '100vh'}}>
      <h1 className="mb-4 fw-bolder text-end text-dark">اسکریپر ترب</h1>
      <form onSubmit={handleScrape} className="mb-4 text-end bg-white p-4 rounded-4 shadow-lg border border-light">
        <div className="mb-3">
          <label htmlFor="url" className="form-label fw-semibold text-dark">آدرس دسته‌بندی ترب</label>
          <input
            id="url"
            type="text"
            className="form-control text-end rounded-3 p-3 border-primary"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="مثال: https://torob.com/browse/94/گوشی-موبایل-mobile/"
            required
            style={{direction:'ltr'}}
          />
          <div className="form-text text-end text-muted mt-2">
            لطفاً لینک یک دسته‌بندی از سایت ترب را وارد کنید (مثلاً صفحه لیست گوشی‌های موبایل یا لپ‌تاپ). لینک باید با <span className="text-primary fw-bold">https://torob.com/browse/</span> شروع شود.
          </div>
        </div>
        <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm" disabled={loading} style={{minWidth:120, padding: '0.75rem 1.5rem'}}>
          {loading ? <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>در حال اسکریپ...</span> : "شروع اسکریپ"}
        </button>
      </form>

      {error && (
        <div className="alert alert-danger text-end rounded-3 shadow-sm" role="alert">
          <h5 className="alert-heading fw-bold">خطا!</h5>
          <p>{error}</p>
          {errorDetails && (
            <small className="d-block text-muted">{errorDetails}</small>
          )}
        </div>
      )}

      {result && result.products && (
        <div className="mt-5">
          <h4 className="mb-4 text-end text-dark">تعداد محصولات یافت شده: <span className="text-primary fw-bolder">{result.products.length}</span></h4>
          <div className="row g-4 justify-content-center">
            {result.products.map((product, idx) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex" key={idx}>
                <div className="card h-100 shadow-lg border-0 position-relative w-100 rounded-4">
                  {product.isAd && (
                    <span className="badge bg-warning text-dark position-absolute m-3 fs-6 px-3 py-2 rounded-pill shadow-sm" style={{zIndex:2, top:0, right:0}}>آگهی</span>
                  )}
                  <div className="bg-light d-flex align-items-center justify-content-center p-3 rounded-top-4" style={{height: 180}}>
                    {product.img ? (
                      <img
                        src={product.img}
                        alt={product.name}
                        className="img-fluid"
                        style={{ objectFit: "contain", maxHeight: 160, maxWidth: '90%' }}
                        loading="lazy"
                      />
                    ) : (
                      <svg width="80" height="80" fill="#dee2e6" className="bi bi-image" viewBox="0 0 16 16">
                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                      </svg>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column text-end p-4">
                    <h6 className="card-title mb-3 fw-bolder text-truncate text-dark" title={product.name} style={{ minHeight: 48 }}>{product.name || <span className="text-muted fst-italic">بدون نام</span>}</h6>
                    
                    <div className="mb-2 d-flex align-items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#0d6efd" className="bi bi-cash-coin me-2" viewBox="0 0 16 16"><path d="M11 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8zm13 0A6 6 0 1 0 2 8a6 6 0 0 0 12 0z"/><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1z"/></svg>
                      <span className="fw-bold text-secondary">قیمت:</span> <span className={product.price ? "text-success fw-bold me-auto" : "text-muted fst-italic me-auto"}>{product.price || "نامشخص"}</span>
                    </div>
                    <div className="mb-3 d-flex align-items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fd7e14" className="bi bi-shop me-2" viewBox="0 0 16 16"><path d="M2.97 1.5A1.5 1.5 0 0 0 1.5 3v1.528a2.5 2.5 0 0 0 0 4.944V13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9.472a2.5 2.5 0 0 0 0-4.944V3a1.5 1.5 0 0 0-1.47-1.5H2.97zm0 1h10.06A.5.5 0 0 1 13.5 3v1.528a2.5 2.5 0 0 0 0 4.944V13a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V9.472a2.5 2.5 0 0 0 0-4.944V3a.5.5 0 0 1 .47-.5z"/></svg>
                      <span className="fw-bold text-secondary">فروشگاه:</span> <span className={product.shops ? "text-info fw-bold me-auto" : "text-muted fst-italic me-auto"}>{product.shops || "-"}</span>
                    </div>
                    
                    <a
                      href={product.link.startsWith('http') ? product.link : `https://torob.com${product.link}`}
                      className="btn btn-outline-primary mt-auto rounded-pill fw-bold p-2"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{transition: 'all 0.3s ease', minHeight: '45px'}}
                    >
                      مشاهده در ترب
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

