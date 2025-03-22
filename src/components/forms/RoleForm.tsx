// RoleForm.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase.ts";
import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import {Input} from "@/components/ui/input.tsx"; // Adjust the path as necessary

// Define the schema for the form
const formSchema = z.object({
    role: z.string({ required_error: "Please select a role." }),
});

type FormData = z.infer<typeof formSchema>;

const RoleForm = () => {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);

    // Initialize the form with react-hook-form and zod resolver
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            role: "",
        },
    });

    // Fetch roles from Supabase
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const { data, error } = await supabase.from("roles").select("*");
                if (error) {
                    console.error("Error fetching roles:", error.message);
                    toast.error(`Failed to fetch roles: ${error.message}`);
                } else {
                    setRoles(data);
                }
            } catch (error) {
                console.error("Unexpected error fetching roles:", error);
                toast.error("An unexpected error occurred while fetching roles.");
            }
        };

        fetchRoles();
    }, []);

    // Handle form submission
// Handle form submission
    const onSubmit: SubmitHandler<FormData> = async (values) => {
        console.log(values);
        setLoading(true);
        try {
            // Get the current user from Supabase
            const { data: userSession, error: userError } = await supabase.auth.getUser();

            if (userError || !userSession.user) {
                console.error("Error getting user session:", userError?.message || "User not found");
                toast.error("Failed to get user session. Please log in first.");
                return;
            }

            const userId = userSession.user.id;
            console.log("userId",userId)

            // Insert the selected role into the user_role table
            const { error } = await supabase
                .from("user_role")
                .insert([
                    {
                        id: userId,
                        role: parseInt(values.role, 10), // Ensure the role ID is an integer
                    },
                ]);

            if (error) {
                console.error("Error assigning role:", error.message);
                toast.error(`Failed to assign role: ${error.message}`);
            } else {
                toast.success("Role assigned successfully");
                // Redirect or perform other actions after successful role assignment
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
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            {roles&&roles.length===0?(
                                <Input disabled placeholder={"Getting roles..."}/>

                            ):(  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={`${role.id}`}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>)}

                            <FormMessage />
                        </FormItem>

                    )}
                />
                <Button disabled={loading} type="submit" className="w-full">
                    {loading ? (
                        <Loader className="animate-spin" />
                    ) : (
                        <span>Submit</span>
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default RoleForm;