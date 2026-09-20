import { A, INK, LAVENDER, PINK, PINK_LIGHT, PURPLE, TEAL } from "./brand";

export const LOGO = A("2815ef3cbf90965172950237f415dfead2462fc8", "1789909498660890");
export const STAR = A("e76ac0c742a7bfaab06dd8d473b5b4e64fb4fb1f", "1789909498665119");
export const HERO_PERSON = A("c4aed01edd5049241df70a2b63c9bbde56a47896", "1789909498714486");
export const HERO_ARROW = A("ae47034d3c2b6f9b629d235e7ce626d32a566e5d", "1789909498683619", "svg");
export const LUNA = A("f7c0f5a5568a54f1dde2898fec651522b68b0ef8", "1789909498678054", "jpg");
export const SERVICE_PERSON = A("6fc76eeec1fc0475b0b2c4fed172a2dd89f6bcfc", "1789909498879537");
export const FOOTER_PORTRAIT = A("454e9980d55ff19e9f1d4e3029514e9a332fb7ec", "1789909499114993", "jpg");

export const HERO_STICKERS = [
  { id: A("055a210c1948ebebdad7846fd82dc326825e1e55", "1789909498657425", "svg"), cls: "w-16 sm:w-20 lg:w-28 top-0 right-[-11%]" },
  { id: A("cb65ff875937f4a3479b723f692b9c19065caf28", "1789909498680732", "svg"), cls: "w-14 lg:w-[110px] left-[21%] top-[31%]" },
  { id: A("feb195c82de9f8e8a5a03ccf6feefe3f9f33277c", "1789909498674904", "svg"), cls: "w-6 lg:w-[35px] left-[5%] top-[30%]" },
  { id: A("28ce6c9361ccc969b265f695605d0ea762e2c763", "1789909498659327", "svg"), cls: "w-10 lg:w-[70px] left-[-6%] top-[42%]" },
  { id: A("ea634b69b3625a481cb1f1be1a927b5f5e3b8be7", "1789909498666254", "svg"), cls: "w-14 lg:w-[110px] left-[5%] top-[53%]" },
];

export const SERVICES = [
  { label: "Klaviyo Email Automation & Flow", bg: PINK, fg: "rgb(254,254,254)" },
  { label: "Email Design", bg: LAVENDER, fg: INK },
  { label: "Event Production", bg: PURPLE, fg: "rgb(254,254,254)" },
  { label: "Reputation Strategy & Management", bg: TEAL, fg: "#fff" },
  { label: "Paid Ads", bg: PURPLE, fg: "rgb(254,254,254)" },
  { label: "Brand Storytelling", bg: TEAL, fg: "rgb(254,254,254)" },
  { label: "Swag Design", bg: PINK_LIGHT, fg: INK },
  { label: "Social Media Strategy", bg: LAVENDER, fg: INK },
  { label: "Social Media Content", bg: PINK, fg: "rgb(254,254,254)" },
  { label: "Shopify Subscription Setup & Management", bg: PURPLE, fg: "rgb(254,254,254)" },
  { label: "Reporting & Data", bg: PINK_LIGHT, fg: INK },
];

export const TOOLBOX = [
  A("6dda1d55e1edd24f8e8b7263a69d2a7d2df3ac43", "1789909498771927", "svg"),
  A("d38c31018c606d20f2dcfc13f9aa6fd0f5d9a30a", "1789909498817571", "svg"),
  A("ccddafeee887321cad7ca56d5f194d62ab2db49d", "1789909498815883", "svg"),
  A("34e1708d8ca04800513036b8863dd4b78de2ba9d", "1789909498820724", "svg"),
  A("85768e3a65404cb9c5abde92cd5d02c9a13e574d", "1789909498819935", "svg"),
  A("8af38476fe7dec33409f061d249565f929de1896", "1789909498819401", "svg"),
  A("d3e00aca30ddff4029550347b4446aa0a44d7870", "1789909498828438", "svg"),
];

export const WORK_IMAGES = [
  A("9ccc3bed529cc1ebae7c9b1ae56c142b1000ac43", "1789909498991296"),
  A("f32270ebd675c1dab5ad1776178bd29401768181", "1789909499041478"),
  A("4f1292da5cb2f89c34c1e95577ac203823a04b7e", "1789909499062305"),
  A("09611869a89472ddd6188e03a43dfc694e2e426b", "1789909499162440"),
  A("e15d034842c78a4851996359ce4fb5e2d4cf1b3d", "1789909499064548"),
  A("57342a9edcfdd27a7b9983bb926f3afc595a543a", "1789909499094756"),
  A("35b31cc6a708d7388481396702cc43f31dd1ef8b", "1789909499011578"),
];

export const WORK_TABS = [
  "Social Strategy, Content, and Design",
  "Content Creation",
  "Email Design & Automations",
];

export type Testimonial = {
  quote: string;
  name: string | null;
  handle: string | null;
  avatar: string | null;
  tag: string | null;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Eclectic Creative studio has this unique ability to combine technical expertise with creative insight, explaining not just what to do but why each email strategy decision matters for getting real responses. Despite being a boutique studio, Marissa delivers the output and results you'd expect from a full marketing department — she completely overhauled our nurturing campaigns into something that actually connects.",
    name: null,
    handle: null,
    avatar: null,
    tag: null,
  },
  {
    quote:
      "We're so glad we answered Marissa's DM at Jalapa Jar — a chance customer service encounter led to a great working relationship! She jumped in and leveled up our Salsa Club membership game, enhancing the offering and marketing efforts on social. Everything from posting cadence to hiring & liaising with freelancers to create great, impactful new content. Our regular working sessions were full of good, creative ideas that were on brand but also scrappy, actionable and practical. She's detail oriented, organized, resourceful — seriously made our team stronger and helped us grow. Highly recommend her for anyone needing a marketing boost!",
    name: "Tommy",
    handle: "@tommy",
    avatar: A("30f223f51bcaaba347d6b08c3bf18c77cad6b273", "1789909499058007"),
    tag: "Founder | Jalapa Jar",
  },
  {
    quote:
      "I worked with Marissa for a couple years for my Salon, PRISM Hair in Richmond, VA! And even across the country she slayed our content and was super helpful. She had wonderful ideas, was super organized, and even helped our email campaigns. Because of her the beginning days and years of owning my salon were made easier having her help with our social media and marketing. Can't recommend her for her expertise and experience enough!",
    name: "Brittany",
    handle: "@brittany",
    avatar: A("3adc334b56c8e1ec935c65d20557227973918477", "1789909499082655"),
    tag: "Owner | Prism Hair Salon",
  },
];

export const NAV = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
];
