import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import RegisterForm from "@/components/forms/RegisterForm.tsx";

const RegisterPage = () => {
  return (
    <section className={"w-full flex items-center justify-center min-h-screen"}>
      <Card className={"w-full max-w-sm"}>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Enter Correct details</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter>
          <p className={"w-full flex items-center justify-center text-center"}>
            Already have an account?
            <Link to="/login">
              <Button variant={"link"}>Login</Button>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </section>
  );
};

export default RegisterPage;
