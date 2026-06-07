import Link from "next/link";

export default function Navbar() {
  return (
    <>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.08);
        }

        .navbar-inner {
          max-width: 1500px;
          min-height: 68px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 34px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #062b67;
          text-decoration: none;
        }

        .brand-mark {
          position: relative;
          width: 34px;
          height: 40px;
          flex-shrink: 0;
        }

        .brand-line {
          position: absolute;
          height: 5px;
          background: #f0b323;
          border-radius: 999px;
          transform: rotate(58deg);
        }

        .brand-line-1 {
          left: 10px;
          top: 3px;
          width: 22px;
        }

        .brand-line-2 {
          left: 2px;
          top: 17px;
          width: 29px;
        }

        .brand-line-3 {
          left: 11px;
          top: 30px;
          width: 22px;
        }

        .brand-small {
          margin: 0;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #64748b;
          white-space: nowrap;
        }

        .brand-title {
          margin: 0;
          font-size: 18px;
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: #062b67;
          white-space: nowrap;
        }

        .main-nav {
          display: flex;
          align-items: center;
          gap: 25px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          white-space: nowrap;
        }

        .main-nav a {
          color: #062b67;
          text-decoration: none;
        }

        .main-nav a:hover {
          color: #f0b323;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          color: #062b67;
          white-space: nowrap;
        }

        .login-button {
          border: 1px solid #062b67;
          border-radius: 999px;
          padding: 8px 19px;
          background: white;
          color: #062b67;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        @media (max-width: 700px) {
          .navbar-inner {
            min-height: 150px;
            padding: 14px 18px;
            flex-direction: column;
            align-items: flex-start;
          }

          .navbar-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }

          .main-nav {
            flex-wrap: wrap;
            gap: 12px 18px;
          }

          .navbar-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>

      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-left">
            <Link href="/" className="brand">
              <div className="brand-mark">
                <span className="brand-line brand-line-1" />
                <span className="brand-line brand-line-2" />
                <span className="brand-line brand-line-3" />
              </div>

              <div>
                <p className="brand-small">Online Booking System</p>
                <h1 className="brand-title">
                  Dairy Flat
                  <br />
                  Airways
                </h1>
              </div>
            </Link>

            <nav className="main-nav">
              <Link href="/#book">Search</Link>
              <Link href="/#manage-booking">Manage Booking</Link>
            </nav>
          </div>

          <div className="navbar-right">
            <span>Singapore · English</span>
            <button className="login-button">Log In</button>
          </div>
        </div>
      </header>
    </>
  );
}