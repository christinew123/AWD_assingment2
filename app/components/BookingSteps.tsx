type BookingStep = "flights" | "passengers" | "confirm" | "invoice";

type BookingStepsProps = {
  currentStep: BookingStep;
};

const steps = [
  { key: "flights", number: 1, label: "Flights" },
  { key: "passengers", number: 2, label: "Passengers" },
  { key: "confirm", number: 3, label: "Confirm" },
  { key: "invoice", number: 4, label: "Invoice" },
];

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  return (
    <>
      <style>{`
        .booking-steps {
          width: 100%;
          background: white;
          border-bottom: 1px solid #dbe3ef;
        }

        .booking-steps-inner {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          width: 100%;
        }

        .booking-step {
          min-height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: white;
          color: #062b67;
          border-bottom: 4px solid transparent;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .booking-step.active {
          background: #eef3fa;
          border-bottom-color: #062b67;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f0a000;
          color: white;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0;
        }

        .booking-step.active .step-number {
          background: #062b67;
        }

        @media (max-width: 800px) {
          .booking-steps-inner {
            grid-template-columns: repeat(2, 1fr);
          }

          .booking-step {
            min-height: 60px;
            font-size: 10px;
          }
        }
      `}</style>

      <section className="booking-steps">
        <div className="booking-steps-inner">
          {steps.map((step) => (
            <div
              key={step.key}
              className={
                currentStep === step.key
                  ? "booking-step active"
                  : "booking-step"
              }
            >
              <span className="step-number">{step.number}</span>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}