<script lang="ts">
    import type { ExampleProps } from '$lib/components/props'

    const { message }: ExampleProps = $props()
</script>

<pre>{message}</pre>
