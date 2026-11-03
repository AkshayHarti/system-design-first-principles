import type { Module } from "../types";

export const latency: Module = {
  slug: "latency-and-estimation",
  number: 1,
  part: "physics",
  ready: true,
  title: "The numbers",
  promise:
    "Produce the three numbers that decide whether a design is possible, before you draw a single box.",
  minutes: 90,
  stages: [
    {
      id: "intuition",
      title: "A design is a budget",
      body: `
Every design review argument you have ever sat through was really an argument
about three numbers:

1. **How many requests per second** must this absorb?
2. **How many bytes per second** must it move and keep?
3. **How much time** does one request have before a human notices?

If nobody in the room knows those three numbers, the boxes on the whiteboard are
decorative. The design is not "wrong" — it is unfalsifiable, which is worse.

### The budget has two currencies

**Seconds** and **dollars**. They trade against each other almost linearly, and
that trade is the entire job. You can always make something faster by spending
more, and cheaper by making it slower. A design with no stated tradeoff is a
wish.

### The one thing people get wrong

Latency is not a number. It is a **distribution**, and the part of the
distribution you care about depends on who is asking.

- Your **median** user has a nice time.
- Your **p99** user is the one who files the support ticket, and the one whose
  request is most likely to be the slowest step of somebody else's fan-out.

Once one request fans out to many services, the tail stops being an edge case.
A single request is only as fast as its slowest dependency, so the more
dependencies you add, the more likely you are to roll a slow one.

> A system's p99 is a property of its fan-out, not of its average component.

Hold that sentence. Module 1 proves it with arithmetic.
`,
    },
    {
      id: "derive",
      title: "Derive it by hand",
      body: `
### The latency ladder

You need roughly a dozen numbers in your head. Orders of magnitude are enough —
being wrong by 2× is fine, being wrong by 1000× is how designs die.

| Operation | Time | Scale |
| --- | --- | --- |
| L1 cache hit | 1 ns | — |
| Main memory read | 100 ns | ×100 |
| Compress 1 KB (Snappy) | 2 µs | ×20 |
| Send 1 KB over 1 Gbps | 8 µs | ×4 |
| SSD random read | 100 µs | ×12 |
| Round trip inside one datacenter | 500 µs | ×5 |
| Disk seek | 10 ms | ×20 |
| Round trip US coast-to-coast | 30 ms | ×3 |
| Round trip US → India | 180 ms | ×6 |

Read the right column, not the left. The gap between memory and a disk seek is
five orders of magnitude, and the gap between one datacenter hop and one
intercontinental hop is four. **Geography is not a detail; it is a latency
budget line item you cannot optimise away.**

### Worked example: a feed product

> 1,000,000 daily active users. Each opens the app 12 times a day and performs
> one write (a post, a like, a read receipt) every other day.

**Reads per second.** 1M × 12 = 12M/day. Divide by 86,400 s → **139 rps**.
Traffic is not flat, so apply a peak factor of 3 → **~420 rps**.

**Writes per second.** 1M / 2 = 500k/day → 5.8 rps average, **~17 rps** at peak.
Writes are 25× cheaper than reads here. That asymmetry is why caching works.

**Storage per year.** A write is 4 KB. 500k × 4 KB = **2 GB/day** → 730 GB/year.
With 3× replication, **2.2 TB/year**. Annoying, not fatal.

Now change one input. The write carries a 200 KB image instead of 4 KB:
**100 TB/year raw, 300 TB replicated.** Same product, same "scale", a completely
different system. This is the entire value of doing the arithmetic first — it
tells you which input your architecture is actually a function of.

**Sizing.** At 420 rps peak, a service that handles 250 rps per node at p99 needs
2 nodes; N+2 for failure and deploys gets you to 4. Four mid-size instances at
roughly $70/month is **$280/month**, or **$0.78 per million requests**. That last
number is the one your finance partner will ask for.

### The tail arithmetic

Assume each of *n* parallel shards returns within its p99 with probability 0.99.

Probability that **all** shards are fast: 0.99^n.

| Shards | All fast | At least one slow |
| --- | --- | --- |
| 1 | 99.0% | 1% |
| 10 | 90.4% | 9.6% |
| 20 | 81.8% | 18.2% |
| 100 | 36.6% | **63.4%** |
| 200 | 13.4% | **86.6%** |

At 100 shards, two out of three requests wait on a tail. Your average latency
still looks fine — the mean is dominated by the fast majority — while your p99
is a different product.

Three ways out, all with a price:

- **Fewer shards.** Less parallelism, more work per shard. Cheap, limited.
- **Hedged requests.** Send a duplicate to another replica after a timeout and
  take the first answer. Cuts p99 hard, costs extra capacity.
- **Do less work per request.** Precompute. The only move that improves both
  latency and cost, and the hardest one to retrofit.

Notice what is *not* on the list: "make the slow shard faster". You cannot
optimise a distribution's tail by improving its mean.
`,
      check: {
        question:
          "A request fans out to 50 shards. Each shard meets its p99 target 99% of the time, independently. Roughly what fraction of requests will wait on at least one tail?",
        options: ["1%", "13%", "40%", "99%"],
        answer: 2,
        explain:
          "0.99^50 ≈ 0.605, so about 39.5% of requests hit at least one slow shard. Tails multiply under fan-out — this is why p99 targets must be set per fan-out width, not per service in isolation.",
      },
    },
    {
      id: "play",
      title: "Play with the tail",
      body: `
Drag the shard count up and watch the p99 of the whole request separate from
the p99 of a single shard. Then turn on **hedging** and watch the latency drop
while the extra work climbs.

The model fits a log-normal distribution to your p50 and p99, then takes the
maximum over *n* shards across 4,000 simulated requests. Nothing is faked: the
collapse you are about to see is what the arithmetic actually does.
`,
      widget: "fanout-tail",
    },
    {
      id: "break",
      title: "Break it: 10× traffic",
      body: `
The feed product from the derive stage just got a launch. Traffic is 10×, and
nobody changed the retention policy.

Use the model. The question is not "does it break" — it will. The question is
**which line of the budget breaks first**, because that determines whether the
fix is a code change, a purchasing decision, or a product decision.

Three things to try:

1. Multiply daily active users by 10. Watch node count and monthly cost.
2. Raise the average payload to 200 KB. Watch storage per year cross from
   "fine" to "a line item that needs a director".
3. Set retention to 3650 days. Ask what the *product* actually needs, because
   the answer is almost never "everything, forever, hot".

Junior engineers fix the first chart. Principals fix the third input.
`,
      widget: "capacity-model",
    },
    {
      id: "decide",
      title: "Decide, and write it down",
      body: `
You have a p99 of 900 ms caused by a 50-way fan-out, and a product target of
300 ms. You have three options:

| Option | Latency | Cost | Risk |
| --- | --- | --- | --- |
| **A.** Cut fan-out to 10 shards | ~200 ms p99 | same | each shard does 5× work; reshapes the data model |
| **B.** Hedge after p95 | ~250 ms p99 | +40% read capacity | duplicate load can amplify an outage |
| **C.** Precompute the aggregate | ~40 ms p99 | +15% write cost, 1 new pipeline | staleness window; new failure mode |

There is no correct answer — there is a defensible one, with a named owner and a
reversal condition.

Write the decision as a four-line ADR:

- **Decision:** which option.
- **Because:** the number that drove it.
- **We accept:** the cost you are knowingly paying.
- **We reverse if:** the observation that would prove you wrong.

If you cannot fill in the last line, you have not made a decision — you have
made a preference.
`,
      check: {
        question:
          "Which of these is a real architectural decision rather than a preference?",
        options: [
          "\"We'll use Kafka because it's the industry standard for events.\"",
          "\"We accept a 5-minute staleness window so the read path can be precomputed, and we reverse if support tickets cite stale data twice in a week.\"",
          "\"We'll add a cache in front of the database to make it faster.\"",
          "\"Let's go with microservices for scalability.\"",
        ],
        answer: 1,
        explain:
          "Only the second names what is being traded, what is being accepted, and the observation that would reverse it. The others are preferences dressed as decisions: no number, no cost, no reversal condition.",
      },
    },
    {
      id: "say",
      title: "Say it in 150 words",
      body: `
This is the stage that turns understanding into interview signal. Write the
answer you would actually give, out loud, when asked: *"How do you reason about
scale before you design?"*

A shape that works:

> Start with three numbers: peak rps, bytes/day, and the latency budget for one
> request. [One sentence on how you'd estimate each.] Then check whether the
> binding constraint is compute, storage, or fan-out — because each has a
> different fix and only one of them is a code change. [One sentence on the tail:
> fan-out multiplies p99, so the p99 target is a property of the request graph,
> not the service.] Finally, name the tradeoff and the reversal condition:
> we're accepting X cost to buy Y property, and we'd revisit if Z.

Write yours in the notes panel. It is saved per module, and you will be asked to
compare it against your answer in module 13.
`,
    },
  ],
  resources: [
    {
      title: "Latency Numbers Every Programmer Should Know (interactive)",
      url: "https://colin-scott.github.io/personal_website/research/interactive_latency.html",
      kind: "docs",
      note: "The ladder from the derive stage, with a machine-speed slider.",
    },
    {
      title: "Designing Data-Intensive Applications — Kleppmann's lecture series",
      url: "https://www.youtube.com/playlist?list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB",
      kind: "video",
      note: "Chapters 1–2 map directly onto this module. Watch at 1.5×.",
    },
    {
      title: "The Tail at Scale (Dean & Barroso, 2013)",
      url: "https://research.google/pubs/the-tail-at-scale/",
      kind: "paper",
      note: "The canonical paper on tail amplification and hedged requests.",
    },
    {
      title: "Site Reliability Engineering — chapters 1–3",
      url: "https://sre.google/sre-book/table-of-contents/",
      kind: "book",
      note: "Free online. Sets up the language of budgets you'll use in module 12.",
    },
    {
      title: "AWS Builders' Library",
      url: "https://aws.amazon.com/builders-library/",
      kind: "blog",
      note: "Short, practical essays on retries, timeouts and backoff. Read 'Timeouts, retries and backoff with jitter'.",
    },
    {
      title: "system-design-notes (liquidslr)",
      url: "https://github.com/liquidslr/system-design-notes",
      kind: "code",
      note: "Reference notes for the toolbox modules in Part II.",
    },
  ],
};
