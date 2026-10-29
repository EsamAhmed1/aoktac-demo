# Film provenance

film-1280.mp4 and film-960.mp4 are one 22.13 s film joined from four Higgsfield Kling v3.0 clips (pro mode, no sound, 16:9), generated 2026-10-29. Each clip runs between two keyframes made with Nano Banana Pro from Aoktac's own website photos (TEC BLOW RL-12 product photo, heating oven photo, workshop photo, service photo). Encoded with ffmpeg: H.264, CRF 25, keyframe every 4 frames, no audio.

| Clip | Job | Start frame | End frame | Prompt |
|---|---|---|---|---|
| 1, 6 s | c83513d9-16a1-49df-b0e5-ecf331adeaad | still-0 (hall) | still-1 (oven) | One unbroken, smooth camera move with no cuts. The camera glides forward across the clean white bottling hall toward the white TEC BLOW machine, slowly moving in through its open glass door into the machine, and arrives at the infrared heating oven where clear PET preforms stand on rotating spindles in front of glowing amber lamps. Steady, cinematic, constant speed, realistic industrial detail. |
| 2, 5 s | 3daee7e5-5f5a-40e4-8550-18ad77744a34 | still-1 | still-2 (open mold, preform) | One unbroken, smooth camera move with no cuts. The preforms turn slowly on their spindles as they move along the row past the glowing amber lamps. The camera follows one glowing preform as it leaves the oven and arrives, hanging by its neck ring, centered between two open polished steel mold halves under a steel stretch rod. Precise, mechanical, realistic. |
| 3, 6 s | e2db504e-0c1c-4845-b78c-9791ad817200 | still-2 | still-3 (open mold, bottle) | Static symmetrical camera. The two polished steel mold halves slide together and close around the glowing preform. The steel stretch rod drives straight down into the preform. A moment later the mold halves slide apart again, revealing that the preform has been blown into a crystal clear 500 ml PET bottle that exactly matches the mold cavity shape, and the stretch rod withdraws upward. Precise, fast, mechanical industrial motion, realistic. |
| 4, 5 s | d92e85ab-f0ab-413f-ba72-e92013549910 | still-3 | still-4 (conveyor) | One unbroken, smooth camera move with no cuts. The finished clear bottle is lifted out of the mold and the camera pulls back and pans as it joins a single-file line of identical clear PET bottles moving along a stainless steel conveyor, out of the white machine into the bright white bottling hall. Calm, steady, realistic. |

The film is a process visualization, labelled as such on the page. Replace with real Aoktac line footage when available.

## Round 2 additions (2026-10-29)

**Factory approach film.** factory-1280.mp4 (16:9) and factory-720p.mp4 (9:16, phones) are 10 s Higgsfield Kling v3.0 pro clips, no sound. Desktop job 7a1242de-2539-4b8a-b92e-48e0873e89a8 starts from Aoktac's own photo https://aoktac.com/Images/company-02.jpg. Portrait job 5a6e63c1-a252-4e00-8d40-c71ec4fdceea starts from Nano Banana Pro job 845b7ad7-49b2-4b28-be1e-0087bab71a6a, a vertical reframe of the same photo. Both use start frames only. End frames that invented an entrance were generated and rejected. Prompt: "One slow, steady, continuous camera push-in with no cuts... The buildings stay exactly as they are... Nothing new appears." Encoded H.264 CRF 26, keyframe every 4 frames.

**3D machine models** (assets/models/). tecblow-rl12.glb: Higgsfield Tripo H3.1 image-to-3D, job 1cf67295-a959-4b69-82b2-6f40f9f69baf, from https://aoktac.com/Images/ig11/ig11.jpg (TEC BLOW RL-12 product photo). tecblow-large.glb: job 6f7121a0-8830-43df-a915-dd8df69594b7, from https://aoktac.com/Images/ig15/ig15.jpg (large-container TEC BLOW photo). Textures reduced to 1024 px JPEG, geometry meshopt-compressed with gltf-transform 4.1.1. They are single-image reconstructions, not CAD.

**Bottles** are procedural geometry in showcase3d.js, sized to each model's published maximum container (diameter x height).

**Sector photos** (assets/img/sector-*-hd.webp) are Aoktac's own website images ps01 to ps06, upscaled with Higgsfield bytedance_image_upscale.

## Round 3 (2026-10-30): video upscale and 3D rebuild

**Video audit.** The round-2 web files were downscaled to 1280x720 and 960x540 at 1.7 to 3.1 Mbps with a keyframe every 4 frames, which made them blocky at full screen. The originals were 1928x1076 (film) and 1976x1048 / 1076x1928 (factory) at 10 to 19 Mbps.

**Upscale.** All six source clips (film clips 1 to 4, factory 16:9 and 9:16) were AI-upscaled with Higgsfield bytedance_video_upscale, preset "aigc", to 2K (2580x1440, 2710x1440 and 1440x2580). Jobs: 767663e3-9c84-43a7-92a9-8185948fc663, c9871e85-6484-463c-9c71-61c919a586f8, 49602361-cc72-4aaf-9d85-e4e0b6380d70, c4271cb9-b75b-4259-bcd3-b5bdc09f3409, 52eba32e-6973-4c09-858f-686fb70074a5, 5f3e0a90-f314-42a6-98c8-e82c4d81af37.

**Web encodes** (H.264 High, x264 slow, tune film, keyframe every 6 frames, Lanczos downscale from 2K):
- film-1920.mp4, 1920x1080, CRF 21 (desktop)
- film-1920-lite.mp4, 1920x1080, CRF 27 (phones, tablets, slow connections)
- factory-1920.mp4, 1920x1080, CRF 22 (landscape)
- factory-1080p.mp4, 1080x1920, CRF 26 (portrait)

**3D machines.** tecblow-large.glb was regenerated with Higgsfield Hunyuan3D v3 (job 51044072-ed3e-4ca1-8fa4-f20c02808fc5, 500k faces, PBR) from aoktac.com ig15, simplified to 42% with meshoptimizer, textures 2048 px. A Hunyuan3D RL-12 (job 4a4e24d8-4f08-4e24-a001-bdeb3bb3c502) was generated and rejected because it garbled the TEC BLOW lettering; tecblow-rl12.glb remains the Tripo reconstruction, now with 2048 px textures. Both are single-image reconstructions, not CAD.

## Round 4 (2026-10-30): real machine photos replace the 3D machines

The 3D machine models (tecblow-rl12.glb, tecblow-large.glb) and their pre-rendered fallbacks were removed from the site. The machine panel now shows five cut-out machine photos supplied by the client on 2026-10-30 (originals kept in source/machines-supplied/). Each was only trimmed to its alpha bounds with 12 px padding and saved as WebP (quality 94, lossless-quality alpha) at its native resolution; nothing was retouched, upscaled, regenerated or recoloured.

| File | Supplied | Matches aoktac.com | Shown at |
|---|---|---|---|
| machine-0.webp | 8.webp, 1448x1086 | not on the site; a two-step machine with panels off (preform oven, blow station) | 0.6 L |
| machine-1.webp | 5.png, 1200x900 | ig13, the TEC BLOW RL-6II product photo | 2 L |
| machine-2.webp | 9.png, 1200x900 | ig04, AOK-2000 NEW TEC (standard range) | 5 L |
| machine-3.webp | 6.webp, 1200x900 | ig07 to ig09, one-step injection stretch blow molding machine | 20 L |
| machine-4.webp | 7.png, 1200x900 | ig15 and ig19, the large-container photo on the RL-4-5L, RL-2-20L and RL-1-30L pages | 30 L |

Only the 2 L and 30 L pairings are backed by Aoktac's product pages. The 5 L and 20 L credits state that the pictured machine is not the model in the spec card.
