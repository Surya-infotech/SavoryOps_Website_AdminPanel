import { createTheme } from "@mui/material/styles";

/**
 * MUI theme aligned with CSS variables:
 * - Primary:   var(--primary-color)
 * - Secondary: var(--secondary-color)
 * - Surfaces:  var(--page-color), var(--form-input-color)
 * - Text:      var(--text-color)
 */
export const muiTheme = createTheme({
    typography: {
        fontFamily:
            "\"Poppins\", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        h6: { fontWeight: 700 },
        button: { textTransform: "none", fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    palette: {
        // MUI palette requires concrete colors; CSS vars would crash createTheme().
        primary: { main: "#1976d2" },
        secondary: { main: "#9c27b0" },
        background: {
            default: "var(--body-background-color)",
            paper: "var(--page-color)",
        },
        text: {
            primary: "var(--text-color)",
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "var(--body-background-color)",
                    color: "var(--text-color)",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    paddingInline: 16,
                    paddingBlock: 10,
                },
                containedPrimary: {
                    background: "var(--primary-color)",
                    color: "#fff",
                },
                outlinedPrimary: {
                    borderColor: "var(--primary-color)",
                    color: "var(--primary-color)",
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: "small",
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: "var(--form-input-color)",
                },
                notchedOutline: {
                    borderColor: "rgba(0,0,0,0.16)",
                },
            },
        },
    },
});
