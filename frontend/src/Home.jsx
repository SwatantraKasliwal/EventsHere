import React from "react";
import Committee from "./Committee";
import Carousel from "./Carousel";
import "./Home.css";

function Home() {
  // Carousel slides data for the three carousels
  const eventSlides1 = [
    {
      title: "Shinning Stars",
      description:
        "Our flagship technical festival featuring coding competitions, workshops, and expert talks.",
      image: "https://i.ytimg.com/vi/3fbR7U3ICFE/maxresdefault.jpg",
      link: "/events/techfest",
    },
    {
      title: "CESA Fair",
      description:
        "A platform for students to showcase their innovative ideas and projects.",
      image: "https://cesa-vppcoe.vercel.app/images/CESA22.jpg",
      link: "/events/innovation-summit",
    },
    {
      title: "Business Fair 2025",
      description:
        "Connect with top companies and explore internship and job opportunities.",
      image:
        "https://img.freepik.com/premium-photo/local-business-fair-poster-banner_1029473-184381.jpg",
      link: "/events",
    },
  ];

  const eventSlides2 = [
    {
      title: "Cultural Festival",
      description:
        "Celebrate diversity through music, dance, and art performances.",
      image:
        "https://i.ytimg.com/vi/dOwUuILy6bY/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGFcgZSg7MA8=&rs=AOn4CLBb4fSPtbpSRa8tWLiVCX7ia9AHfw",
      link: "/events",
    },
    {
      title: "Sportive",
      description:
        "Annual inter-college sports competition across various disciplines.",
      image: "https://img.loigiaihay.com/picture/2022/0827/1sports.jpg",
      link: "/events",
    },
    {
      title: "Alumni Meet",
      description:
        "Reconnect with alumni and build valuable professional networks.",
      image:
        "https://th.bing.com/th/id/OIP.lhPQATu9ziU9zfWV2yQw6gHaEd?rs=1&pid=ImgDetMain",
      link: "/events",
    },
  ];

  const eventSlides3 = [
    {
      title: "Quasar",
      description: "48-hour coding marathon to solve real-world challenges.",
      image: "https://i.ytimg.com/vi/6Gd6jDe9gBQ/maxresdefault.jpg",
      link: "/events",
    },
    {
      title: "GDSC Workshops",
      description:
        "Industry experts conduct hands-on workshops on cutting-edge technologies.",
      image: "https://linktr.ee/og/image/gdsc_vppcoe.jpg",
      link: "/events",
    },
    {
      title: "Research Symposium",
      description:
        "Showcase of research projects and papers by students and faculty.",
      image:
        "https://www.legalbites.in/h-upload/2023/03/31/728988-research-design.webp",
      link: "/events",
    },
  ];

  // Committee data
  const committees = [
    {
      name: "ITSA",
      image:
        "https://img.freepik.com/free-vector/gradient-abstract-technology-company-logotype_52683-9702.jpg",
      description:
        "ITSA is a student-run organization that aims to provide students with the skills and knowledge necessary to succeed in the field of information technology.",
      link: "https://itsa-pvppcoe.vercel.app/",
    },
    {
      name: "CESA",
      image:
        "https://img.freepik.com/premium-vector/modern-abstract-high-tech-logo-design_375081-89.jpg?w=2000",
      description:
        "The Computer Engineering Students Association (CESA) is a student-run organization that aims to provide students with the skills and knowledge necessary to succeed in the field of computer engineering.",
      link: "https://cesa-vppcoe.vercel.app/index.html",
    },
    {
      name: "FESA",
      image:
        "https://static.vecteezy.com/system/resources/previews/019/133/426/non_2x/abstract-digital-connection-technology-logo-template-free-vector.jpg",
      description:
        "The First Year Engineering Students Association (FESA) is a student-run organization that aims to provide first-year students with the skills and knowledge necessary to succeed in their first year of engineering.",
      link: "https://itsa-pvppcoe.vercel.app/",
    },
  ];

  return (
    <div className="home-container">
      <section className="events-section">
        <b>
          <h2 className="home-header">Major College Events</h2>{" "}
        </b>
        <div className="carousels-container">
          <Carousel slides={eventSlides1} />
          <Carousel slides={eventSlides2} />
          <Carousel slides={eventSlides3} />
        </div>
      </section>

      <section className="committees-section">
        <h2 className="home-header">Committees</h2>
        <div className="committees-grid">
          {committees.map((committee, index) => (
            <Committee
              key={index}
              cName={committee.name}
              cImage={committee.image}
              cDesc={committee.description}
              cLink={committee.link}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
