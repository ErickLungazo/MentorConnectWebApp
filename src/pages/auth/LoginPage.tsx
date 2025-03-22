import LoginForm from "@/components/forms/LoginForm.tsx";import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";


const LoginPage = () => {
    return (
        <section className={"w-full flex items-center justify-center min-h-screen"}>
            <Card className={"w-full max-w-sm"}>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter Correct details</CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm/>

                </CardContent>
                <CardFooter>
                    <p className={"w-full flex items-center justify-center text-center"}>
                        Don't have an account?
                        <Link to="/register">
                            <Button variant={"link"}>
                                Register
                            </Button>
                        </Link>

                    </p>
                </CardFooter>
            </Card>

        </section>
    );
};

export default LoginPage;