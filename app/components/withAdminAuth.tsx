"use client";
import { ComponentType } from "react";
import AdminLayout from "./AdminLayout";

export default function withAdminAuth<P extends object>(
    WrappedComponent: ComponentType<P>
) {
    function WithAdminAuthWrapper(props: P) {
        return (
            <AdminLayout>
                <WrappedComponent {...props} />
            </AdminLayout>
        );
    }

    WithAdminAuthWrapper.displayName = `withAdminAuth(${
        WrappedComponent.displayName || WrappedComponent.name || "Component"
    })`;

    return WithAdminAuthWrapper;
}
