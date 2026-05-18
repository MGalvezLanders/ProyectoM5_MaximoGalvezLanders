import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

const ProfilePage = () => {
  return (
    <Container size="md" className="py-12">
      <h1 className="font-display text-3xl font-bold mb-6">Mi perfil</h1>
      <Card>
        <p className="text-leather-700">
          Próximamente: gestión de datos personales y dirección de envío.
        </p>
      </Card>
    </Container>
  );
};

export default ProfilePage;
