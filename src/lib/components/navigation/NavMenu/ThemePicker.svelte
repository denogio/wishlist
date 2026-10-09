<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { LocalStorage } from "$lib/local-storage.svelte";

    interface Props {
        isDarkOnly?: boolean;
    }

    let { isDarkOnly = $bindable(false) }: Props = $props();

    const t = getFormatter();

    const options = [
        { value: "wishlist", label: $t("general.default") },
        { value: "catppuccin-mocha", label: "Catppuccin Mocha" },
        { value: "tokyo-night", label: "Tokyo Night" },
        { value: "everforest", label: "Everforest" },
        { value: "gruvbox", label: "Gruvbox" },
        { value: "rose-pine", label: "Rosé Pine" }
    ];

    const themeLocalStorage = new LocalStorage<string>("theme", "wishlist");

    let value = $state("wishlist");

    const setTheme = (theme: string) => {
        document.documentElement.setAttribute("data-theme", theme);
        isDarkOnly = theme !== "wishlist";
        if (isDarkOnly) {
            document.documentElement.setAttribute("data-mode", "dark");
        }
    };

    $effect(() => {
        const saved = themeLocalStorage.current;
        value = options.some((option) => option.value === saved) ? saved : "wishlist";
        setTheme(value);
    });

    const onchange = (e: Event) => {
        const target = e.target as HTMLSelectElement;
        themeLocalStorage.current = target.value;
    };
</script>

<div class="flex items-center gap-2">
    <label class="text-sm font-medium" for="theme-picker">
        <iconify-icon icon="ion:color-palette-outline"></iconify-icon>
        {$t("general.theme")}
    </label>
    <select id="theme-picker" class="input rounded-container px-2 py-1 text-xs" {onchange} {value}>
        {#each options as { value, label } (value)}
            <option {value}>{label}</option>
        {/each}
    </select>
</div>
