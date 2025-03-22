// RegisterForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase.ts";
import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import {useNavigate} from "react-router-dom"; // Adjust the path as necessary

// Define the schema for the form
const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormData = z.infer<typeof formSchema>;

const RegisterForm = () => {
    const [loading, setLoading] = useState(false);
    const navigate=useNavigate()

    // Initialize the form with react-hook-form and zod resolver
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Handle form submission
    const onSubmit: SubmitHandler<FormData> = async (values) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
            });

            if (error) {
                console.error("Error registering user:", error.message);
                toast.error(`Registration failed: ${error.message}`);
            } else {
                console.log("User registered:", data.user);
                toast.success("Registration successful");
                navigate("/")

                // Redirect or perform other actions after successful registration
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button disabled={loading} type="submit" className="w-full">
                    {loading ? (
                        <Loader className="animate-spin" />
                    ) : (
                        <span>Register</span>
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default RegisterForm;