interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">

      <div className="bg-card p-8 rounded-xl shadow-xl w-[400px]">

        <h2 className="text-xl font-bold text-primary mb-4">
          Contact Us
        </h2>

        <p className="text-muted-foreground mb-2">
          📧 Email: support@findit.com
        </p>

        <p className="text-muted-foreground mb-2">
          📞 Phone: +91 9876543210
        </p>

        <p className="text-muted-foreground mb-6">
          📍 Location: Kerala, India
        </p>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-primary text-black rounded-lg"
        >
          Close
        </button>

      </div>
    </div>
  );
};

export default ContactModal;