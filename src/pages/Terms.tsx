const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-primary mb-8">
          Terms of Service
        </h1>

        <p className="text-muted-foreground mb-6">
          Welcome to FindIt. By using our AI-powered lost and found platform,
          you agree to the following terms and conditions.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          1. Use of the Platform
        </h2>
        <p className="text-muted-foreground mb-4">
          Users can report lost or found items and browse items listed on the
          platform. All information provided must be accurate and truthful.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          2. User Responsibility
        </h2>
        <p className="text-muted-foreground mb-4">
          Users are responsible for the accuracy of item descriptions,
          images, and contact details. False reporting may result in account
          suspension.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          3. Privacy
        </h2>
        <p className="text-muted-foreground mb-4">
          We respect your privacy. Personal information is used only for
          facilitating item recovery and platform communication.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          4. AI Matching System
        </h2>
        <p className="text-muted-foreground mb-4">
          Our AI system helps match lost and found items based on descriptions,
          images, and metadata. However, matches are suggestions and should
          be verified by users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          5. Changes to Terms
        </h2>
        <p className="text-muted-foreground">
          FindIt may update these terms periodically. Continued use of the
          platform means you accept the updated terms.
        </p>

      </div>
    </div>
  );
};

export default Terms;