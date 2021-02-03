import React, { useEffect, useState, useRef } from "react";
import "./styles.scss";

import { getInitData } from "./utility/getInitData";

import {
  NUMBER_OF_MONTH_12,
  NUMBER_OF_MONTH_6,
  MAX_HEIGHT_CHILD,
  CURR_DATE
} from "./constant";

import { debounce } from "lodash";

export default function App() {
  const [data, setData] = useState(
    getInitData({
      year: CURR_DATE.getFullYear(),
      startMonth: CURR_DATE.getMonth() + 1,
      numberOfMonth: NUMBER_OF_MONTH_12
    })
  );

  const [selectDate, setSelectDate] = useState({
    year: CURR_DATE.getFullYear(),
    month: CURR_DATE.getMonth() + 1,
    date: CURR_DATE.getDate()
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSelectDate = (values) => {
    setSelectDate(values);
  };

  const calendarMainRef = useRef();
  const currentDateRef = useRef();

  useEffect(() => {
    const handleUpdateData = debounce(
      ({ target: { scrollHeight }, target: { scrollTop }, target }) => {
        if (scrollTop >= scrollHeight - 2 * MAX_HEIGHT_CHILD) {
          // console.log("LOAD BOTTOM");
          setData((preData) => [
            ...preData,
            ...getInitData({
              year: preData[preData.length - 1].year,
              startMonth: preData[preData.length - 1].month + 1,
              numberOfMonth: NUMBER_OF_MONTH_6
            })
          ]);
          setIsLoading(0);
        } else if (scrollTop <= 2 * MAX_HEIGHT_CHILD) {
          // console.log("LOAD TOP");
          setData((preData) => [
            ...getInitData({
              year:
                preData[0].year -
                (preData[0].month - NUMBER_OF_MONTH_6 <= 0 ? 1 : 0),
              startMonth:
                (preData[0].month - NUMBER_OF_MONTH_6 + 12) % 12 || 12,
              numberOfMonth: NUMBER_OF_MONTH_6
            }),
            ...preData
          ]);
          // handle keep scrollTop = current, not equal new added data
          target.scrollTop =
            calendarMainRef.current.scrollHeight - (scrollHeight - scrollTop);
          setIsLoading(0);
        }
      },
      300
    );

    const handleLoading = ({
      target: { scrollHeight },
      target: { scrollTop }
    }) => {
      if (scrollTop >= scrollHeight - 2 * MAX_HEIGHT_CHILD) setIsLoading(2);
      else if (scrollTop <= 2 * MAX_HEIGHT_CHILD) setIsLoading(1);
      else setIsLoading(0);
    };

    const node = calendarMainRef.current;
    node.addEventListener("scroll", handleUpdateData);
    node.addEventListener("scroll", handleLoading);

    return () => {
      node.removeEventListener("scroll", handleUpdateData);
      node.removeEventListener("scroll", handleLoading);
    };
  }, []);

  useEffect(() => {
    calendarMainRef.current.scrollTop = 1;
  }, []);

  useEffect(() => {
    let options = {
      root: calendarMainRef.current,
      rootMargin: "16px 0px",
      threshold: Math.min(
        calendarMainRef.current.offsetHeight / MAX_HEIGHT_CHILD - 0.05,
        1.0
      )
    };

    let callback = (entries, observe) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= observe.thresholds[0]) {
          document.querySelector(".date-in-viewport").innerHTML =
            entry.target.firstElementChild.innerText;
        }
        // Each entry describes an intersection change for one observed
        // target element:
        //   entry.boundingClientRect
        //   entry.intersectionRatio
        //   entry.intersectionRect
        //   entry.isIntersecting
        //   entry.rootBounds
        //   entry.target
        //   entry.time
      });
    };

    let observer = new IntersectionObserver(callback, options);
    [...calendarMainRef.current.children].forEach((v) => observer.observe(v));
  }, [data]);

  return (
    <div className="App">
      <div className="fixed-modal-calendar">
        <div className="calendar-wrap">
          <CalendarHeader currentDateRef={currentDateRef} />

          <CalendarMain
            ref={{
              calendarMainRef: calendarMainRef,
              currentDateRef: currentDateRef
            }}
            data={data}
            selectDate={selectDate}
            handleSelectDate={handleSelectDate}
            isLoading={isLoading}
          />

          <div className="calendar-footer">
            <button className="none-button" type="button">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CalendarMain = React.forwardRef(
  ({ data, selectDate, handleSelectDate, isLoading }, ref) => {
    return (
      <div className="calendar-main" ref={ref.calendarMainRef}>
        {isLoading === 1 && <div className="text-center">Loading...</div>}
        {data.map((val) => {
          return (
            <Month
              ref={ref.currentDateRef}
              key={"" + val.year + val.month}
              year={val.year}
              month={val.month}
              date={val.date}
              selectDate={selectDate}
              handleSelectDate={handleSelectDate}
            />
          );
        })}
        {isLoading === 2 && <div className="text-center">Loading...</div>}
      </div>
    );
  }
);

const Month = React.forwardRef(
  ({ year, month, date, selectDate, handleSelectDate }, ref) => {
    return (
      <section className="calendar-month-section">
        <label
          className={
            "month-text " +
            (selectDate.month === month && selectDate.year === year
              ? "--current"
              : "")
          }
        >
          Tháng {month} - {year}
        </label>

        <div className="calendar-dates">
          {new Array((date[0].day - 1 + 7) % 7).fill(1).map((v, idx) => (
            <DateBlock isFake={true} key={`${year}${month}f${idx}`} date="f" />
          ))}

          {date.map((val) => {
            const currDate = new Date();
            const isEvent = val.isEvent;
            const isNow =
              currDate.getFullYear() === year &&
              currDate.getMonth() === month - 1 &&
              currDate.getDate() === val.date;
            const isSelect =
              selectDate.year === year &&
              selectDate.month === month &&
              selectDate.date === val.date;
            return (
              <DateBlock
                ref={ref}
                key={"" + year + month + val.date}
                date={val.date}
                month={month}
                year={year}
                isNow={isNow}
                isEvent={isEvent}
                isSelect={isSelect}
                handleSelectDate={handleSelectDate}
              />
            );
          })}
        </div>
      </section>
    );
  }
);

const DateBlock = React.forwardRef(
  (
    {
      date = null,
      month = null,
      year = null,
      isFake = false,
      isNow = false,
      isEvent = false,
      isSelect = false,
      handleSelectDate = () => {}
    },
    ref
  ) => {
    return (
      <button
        ref={isNow ? ref : undefined}
        type="button"
        className={
          "none-button dates-block " +
          (isFake ? "--fake " : "") +
          (isNow ? "--now " : "") +
          (isEvent ? "--event " : "") +
          (isSelect ? "--selected " : "")
        }
        onClick={() =>
          handleSelectDate({ year: year, month: month, date: date })
        }
      >
        {(date + "").padStart(2, "0")}
      </button>
    );
  }
);

const CalendarHeader = ({ currentDateRef }) => {
  return (
    <div className="calendar-header">
      <div className="d-flex p-3">
        <button type="button" className="position-absolute none-button">
          <img
            src="https://cdn.zeplin.io/5fb34afcad408177f27be6dd/assets/8C87EC66-2E3B-4769-BC72-FB58259EA093.svg"
            alt="i-close"
          />
        </button>
        <div className="mx-auto fo-we-bo color-dark"> Lịch đặt tiệc</div>
      </div>
      <div className="calendar-actions d-flex justify-content-between px-3 py-2">
        <div className="calendar-actions-today">
          <button
            type="button"
            onClick={() => {
              currentDateRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            }}
          >
            Hôm nay
          </button>
        </div>
        <div className="calendar-actions-navigate">
          <div>
            <button type="button">
              <img
                src="https://cdn.zeplin.io/5fb34afcad408177f27be6dd/assets/73F32E5C-2CD4-4436-8B71-5E3F0BC579B4.svg"
                alt="<"
              />
            </button>
          </div>
          <div className="fo-we-bo date-in-viewport">Tháng 1 - 2021</div>
          <div>
            <button type="button">
              <img
                src="https://cdn.zeplin.io/5fb34afcad408177f27be6dd/assets/563E3D7B-2236-4185-97FA-54AEB502DE65.svg"
                alt=">"
              />
            </button>
          </div>
        </div>
      </div>
      <div className="calendar-dates">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((v) => {
          return <DateBlock date={v} key={v} />;
        })}
      </div>
    </div>
  );
};
