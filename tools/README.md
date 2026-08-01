# RENDER HARNESS

Runs the real workspace generators **outside the browser** so their output can actually be
inspected. Every gate in this project checks the *code*; this checks the *pixels*.

    cd /home/claude && node run_render.js

Requires `npm install canvas`. Renders into `/home/claude/render_out`.

**Why it exists.** For an entire build session the generators could only be verified by
reading their source, because they need a browser canvas. That let real defects survive
every gate — most notably a lanyard badge that drew a navy logo onto a navy band, so the
mark was invisible. Measurement of the source said "logo placed"; the pixels said
otherwise. The harness closes that gap.

**Faithfulness matters.** The shims must reproduce the engine exactly. The first version
skipped `_logoArt`'s padding trim and reported logos as too small — a false alarm caused
by the harness, not the engine. If you change a helper in workspace.html, change it here.
